import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { EventBusService } from '../events/event-bus.service'
import { WebSocketGateway } from '../websocket/game.gateway'
import { GameTimerService } from './game-timer.service'
import { Chess } from 'chess.js'

export interface MoveData {
  from: string
  to: string
  promotion?: string
}

export interface GameState {
  id: string
  status: string
  currentFen: string
  moves: string[]
  lastMove: string[] | null
  turn: 'white' | 'black'
  winner: 'white' | 'black' | null
  check: boolean
  checkmate: boolean
  stalemate: boolean
  draw: boolean
  whiteTimeLeft: number | null
  blackTimeLeft: number | null
  whitePlayer: any
  blackPlayer: any
  spectators: any[]
}

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name)
  private readonly chessInstances = new Map<string, Chess>()

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly gateway: WebSocketGateway,
    private readonly gameTimer: GameTimerService,
  ) {}

  async getGame(gameId: string, userId?: string): Promise<GameState | null> {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id: gameId },
        include: {
          whitePlayer: true,
          blackPlayer: true,
          spectators: {
            include: { user: true }
          }
        }
      })

      if (!game) return null

      // Check if user has access to this game
      if (userId && !this.canUserAccessGame(game, userId)) {
        throw new BadRequestException('You do not have access to this game')
      }

      return this.formatGameState(game)
    } catch (error) {
      this.logger.error('Error getting game:', error)
      throw error
    }
  }

  async makeMove(gameId: string, userId: string, moveData: MoveData): Promise<{ success: boolean; message: string; gameState?: GameState }> {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id: gameId },
        include: {
          whitePlayer: true,
          blackPlayer: true
        }
      })

      if (!game) {
        return { success: false, message: 'Game not found' }
      }

      // Check if it's the user's turn
      const isWhitePlayer = game.whitePlayerId === userId
      const isBlackPlayer = game.blackPlayerId === userId
      
      if (!isWhitePlayer && !isBlackPlayer) {
        return { success: false, message: 'You are not a player in this game' }
      }

      if (game.status !== 'ACTIVE') {
        return { success: false, message: 'Game is not active' }
      }

      const expectedColor = game.turn === 'WHITE' ? 'white' : 'black'
      const userColor = isWhitePlayer ? 'white' : 'black'
      
      if (expectedColor !== userColor) {
        return { success: false, message: 'It is not your turn' }
      }

      // Get or create chess instance
      let chess = this.chessInstances.get(gameId)
      if (!chess) {
        chess = new Chess(game.currentFen)
        this.chessInstances.set(gameId, chess)
      }

      // Validate move
      const move = chess.move({
        from: moveData.from,
        to: moveData.to,
        promotion: moveData.promotion
      })

      if (!move) {
        return { success: false, message: 'Invalid move' }
      }

      // Update game in database
      const updatedGame = await this.prisma.game.update({
        where: { id: gameId },
        data: {
          currentFen: chess.fen(),
          moves: [...game.moves, `${moveData.from}${moveData.to}${moveData.promotion || ''}`],
          lastMove: [moveData.from, moveData.to],
          turn: chess.turn() === 'w' ? 'WHITE' : 'BLACK',
          check: chess.inCheck(),
          checkmate: chess.isCheckmate(),
          stalemate: chess.isStalemate(),
          draw: chess.isDraw(),
          winnerColor: chess.isCheckmate() ? (chess.turn() === 'w' ? 'BLACK' : 'WHITE') : null,
          status: chess.isCheckmate() || chess.isStalemate() || chess.isDraw() ? 'COMPLETED' : 'ACTIVE'
        },
        include: {
          whitePlayer: true,
          blackPlayer: true,
          spectators: {
            include: { user: true }
          }
        }
      })

      // Update chess instance
      this.chessInstances.set(gameId, chess)

      // Emit move event
      await this.eventBus.emit('game.move', {
        gameId,
        move: moveData,
        fen: chess.fen(),
        turn: chess.turn(),
        check: chess.inCheck(),
        checkmate: chess.isCheckmate(),
        stalemate: chess.isStalemate(),
        draw: chess.isDraw()
      })

      // Emit WebSocket event
      this.gateway.server.to(gameId).emit('move', {
        gameId,
        move: moveData,
        fen: chess.fen(),
        turn: chess.turn(),
        check: chess.inCheck(),
        checkmate: chess.isCheckmate(),
        stalemate: chess.isStalemate(),
        draw: chess.isDraw()
      })

      // Switch turn if game is still active
      if (updatedGame.status === 'ACTIVE') {
        await this.gameTimer.switchTurn(gameId)
      }

      // Handle game end
      if (updatedGame.status === 'COMPLETED') {
        await this.gameTimer.stopTimer(gameId)
        await this.handleGameEnd(updatedGame)
      }

      return {
        success: true,
        message: 'Move made successfully',
        gameState: this.formatGameState(updatedGame)
      }
    } catch (error) {
      this.logger.error('Error making move:', error)
      return { success: false, message: 'Failed to make move' }
    }
  }

  async joinGame(gameId: string, userId: string, asSpectator: boolean = false): Promise<{ success: boolean; message: string }> {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id: gameId }
      })

      if (!game) {
        return { success: false, message: 'Game not found' }
      }

      if (asSpectator) {
        if (!game.allowSpectators) {
          return { success: false, message: 'Spectators not allowed' }
        }

        // Add as spectator
        await this.prisma.gameSpectator.upsert({
          where: {
            gameId_userId: {
              gameId,
              userId
            }
          },
          create: {
            gameId,
            userId
          },
          update: {}
        })

        // Join WebSocket room
        this.gateway.server.sockets.sockets.forEach(socket => {
          if (socket.data.userId === userId) {
            socket.join(gameId)
          }
        })

        return { success: true, message: 'Joined as spectator' }
      } else {
        // Check if game has available slots
        if (game.whitePlayerId && game.blackPlayerId) {
          return { success: false, message: 'Game is full' }
        }

        // Assign player to available slot
        const updateData: any = {}
        if (!game.whitePlayerId) {
          updateData.whitePlayerId = userId
        } else if (!game.blackPlayerId) {
          updateData.blackPlayerId = userId
        }

        await this.prisma.game.update({
          where: { id: gameId },
          data: updateData
        })

        // Join WebSocket room
        this.gateway.server.sockets.sockets.forEach(socket => {
          if (socket.data.userId === userId) {
            socket.join(gameId)
          }
        })

        // Start game if both players are present
        if (game.whitePlayerId && game.blackPlayerId) {
          await this.startGame(gameId)
        }

        return { success: true, message: 'Joined game' }
      }
    } catch (error) {
      this.logger.error('Error joining game:', error)
      return { success: false, message: 'Failed to join game' }
    }
  }

  async leaveGame(gameId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id: gameId }
      })

      if (!game) {
        return { success: false, message: 'Game not found' }
      }

      // Remove from spectators
      await this.prisma.gameSpectator.deleteMany({
        where: {
          gameId,
          userId
        }
      })

      // Leave WebSocket room
      this.gateway.server.sockets.sockets.forEach(socket => {
        if (socket.data.userId === userId) {
          socket.leave(gameId)
        }
      })

      return { success: true, message: 'Left game' }
    } catch (error) {
      this.logger.error('Error leaving game:', error)
      return { success: false, message: 'Failed to leave game' }
    }
  }

  async sendMessage(gameId: string, userId: string, content: string): Promise<{ success: boolean; message: string }> {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id: gameId }
      })

      if (!game) {
        return { success: false, message: 'Game not found' }
      }

      // Check if user has access to this game
      const hasAccess = game.whitePlayerId === userId || 
                       game.blackPlayerId === userId ||
                       await this.prisma.gameSpectator.findFirst({
                         where: { gameId, userId }
                       })

      if (!hasAccess) {
        return { success: false, message: 'You do not have access to this game' }
      }

      // Create message
      const message = await this.prisma.gameMessage.create({
        data: {
          gameId,
          userId,
          content,
          type: 'CHAT'
        },
        include: {
          user: true
        }
      })

      // Emit WebSocket event
      this.gateway.server.to(gameId).emit('message', {
        id: message.id,
        gameId,
        userId,
        content,
        type: message.type,
        user: message.user,
        createdAt: message.createdAt
      })

      return { success: true, message: 'Message sent' }
    } catch (error) {
      this.logger.error('Error sending message:', error)
      return { success: false, message: 'Failed to send message' }
    }
  }

  private async startGame(gameId: string): Promise<void> {
    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'ACTIVE',
        startedAt: new Date()
      }
    })

    // Start game timer
    await this.gameTimer.startTimer(gameId)

    // Emit game started event
    this.gateway.server.to(gameId).emit('gameStarted', { gameId })
    
    await this.eventBus.emit('game.started', { gameId })
  }

  private async handleGameEnd(game: any): Promise<void> {
    // Update player ratings if rated game
    if (game.isRated && game.winner) {
      await this.updatePlayerRatings(game)
    }

    // Emit game ended event
    this.gateway.server.to(game.id).emit('gameEnded', {
      gameId: game.id,
      winner: game.winner,
      reason: game.checkmate ? 'checkmate' : game.stalemate ? 'stalemate' : 'draw'
    })

    await this.eventBus.emit('game.ended', {
      gameId: game.id,
      winner: game.winner,
      reason: game.checkmate ? 'checkmate' : game.stalemate ? 'stalemate' : 'draw'
    })
  }

  private async updatePlayerRatings(game: any): Promise<void> {
    // Simple ELO rating system
    const kFactor = 32
    const whitePlayer = await this.prisma.user.findUnique({
      where: { id: game.whitePlayerId }
    })
    const blackPlayer = await this.prisma.user.findUnique({
      where: { id: game.blackPlayerId }
    })

    if (!whitePlayer || !blackPlayer) return

    const expectedWhite = 1 / (1 + Math.pow(10, (blackPlayer.rating - whitePlayer.rating) / 400))
    const expectedBlack = 1 / (1 + Math.pow(10, (whitePlayer.rating - blackPlayer.rating) / 400))

    let whiteScore = 0.5 // draw
    let blackScore = 0.5

    if (game.winner === 'WHITE') {
      whiteScore = 1
      blackScore = 0
    } else if (game.winner === 'BLACK') {
      whiteScore = 0
      blackScore = 1
    }

    const newWhiteRating = Math.round(whitePlayer.rating + kFactor * (whiteScore - expectedWhite))
    const newBlackRating = Math.round(blackPlayer.rating + kFactor * (blackScore - expectedBlack))

    await this.prisma.user.update({
      where: { id: whitePlayer.id },
      data: { rating: newWhiteRating }
    })

    await this.prisma.user.update({
      where: { id: blackPlayer.id },
      data: { rating: newBlackRating }
    })
  }

  private canUserAccessGame(game: any, userId: string): boolean {
    return game.whitePlayerId === userId || 
           game.blackPlayerId === userId ||
           game.isPublic
  }

  private formatGameState(game: any): GameState {
    return {
      id: game.id,
      status: game.status,
      currentFen: game.currentFen,
      moves: game.moves,
      lastMove: game.lastMove,
      turn: game.turn.toLowerCase(),
      winner: game.winner?.toLowerCase() || null,
      check: game.check,
      checkmate: game.checkmate,
      stalemate: game.stalemate,
      draw: game.draw,
      whiteTimeLeft: game.whiteTimeLeft,
      blackTimeLeft: game.blackTimeLeft,
      whitePlayer: game.whitePlayer,
      blackPlayer: game.blackPlayer,
      spectators: game.spectators?.map((s: any) => s.user) || []
    }
  }
}
