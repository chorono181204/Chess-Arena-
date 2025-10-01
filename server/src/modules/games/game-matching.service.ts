import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { EventBusService } from '../events/event-bus.service'
import { WebSocketGateway } from '../websocket/game.gateway'

export interface MatchRequest {
  userId: string
  timeControl: string
  isRated: boolean
  minRating?: number
  maxRating?: number
}

export interface MatchResult {
  gameId: string
  whitePlayerId: string
  blackPlayerId: string
  timeControl: string
  isRated: boolean
}

@Injectable()
export class GameMatchingService {
  private readonly logger = new Logger(GameMatchingService.name)
  private readonly matchQueue: Map<string, MatchRequest> = new Map()

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly gateway: WebSocketGateway,
  ) {}

  async requestMatch(request: MatchRequest): Promise<{ success: boolean; message: string; gameId?: string }> {
    try {
      // Check if user is already in queue
      if (this.matchQueue.has(request.userId)) {
        return { success: false, message: 'You are already in the matchmaking queue' }
      }

      // Check if user is already in an active game
      const activeGame = await this.prisma.game.findFirst({
        where: {
          OR: [
            { whitePlayerId: request.userId },
            { blackPlayerId: request.userId }
          ],
          status: { in: ['PENDING', 'ACTIVE'] }
        }
      })

      if (activeGame) {
        return { success: false, message: 'You are already in an active game' }
      }

      // Add to matchmaking queue
      this.matchQueue.set(request.userId, request)
      this.logger.log(`User ${request.userId} added to matchmaking queue`)

      // Try to find a match
      const match = await this.findMatch(request)
      if (match) {
        return { success: true, message: 'Match found!', gameId: match.gameId }
      }

      return { success: true, message: 'Added to matchmaking queue' }
    } catch (error) {
      this.logger.error('Error in requestMatch:', error)
      return { success: false, message: 'Failed to join matchmaking queue' }
    }
  }

  async cancelMatch(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      if (this.matchQueue.has(userId)) {
        this.matchQueue.delete(userId)
        this.logger.log(`User ${userId} removed from matchmaking queue`)
        return { success: true, message: 'Removed from matchmaking queue' }
      }
      return { success: false, message: 'You are not in the matchmaking queue' }
    } catch (error) {
      this.logger.error('Error in cancelMatch:', error)
      return { success: false, message: 'Failed to cancel matchmaking' }
    }
  }

  private async findMatch(request: MatchRequest): Promise<MatchResult | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: request.userId }
    })

    if (!user) return null

    // Find compatible opponents
    for (const [opponentId, opponentRequest] of this.matchQueue.entries()) {
      if (opponentId === request.userId) continue

      // Check compatibility
      if (this.isCompatible(request, opponentRequest, user.rating)) {
        // Remove both from queue
        this.matchQueue.delete(request.userId)
        this.matchQueue.delete(opponentId)

        // Create game
        const game = await this.createGame(request, opponentRequest, request.userId, opponentId)
        
        // Notify both players
        await this.notifyMatchFound(game, request.userId, opponentId)
        
        return {
          gameId: game.id,
          whitePlayerId: game.whitePlayerId!,
          blackPlayerId: game.blackPlayerId!,
          timeControl: game.timeControl,
          isRated: game.isRated
        }
      }
    }

    return null
  }

  private isCompatible(request1: MatchRequest, request2: MatchRequest, user1Rating: number): boolean {
    // Same time control
    if (request1.timeControl !== request2.timeControl) return false
    
    // Same rated preference
    if (request1.isRated !== request2.isRated) return false

    // Rating compatibility for rated games
    if (request1.isRated) {
      const ratingDiff = Math.abs(user1Rating - (request2.minRating || 0))
      const maxDiff = 200 // Allow 200 rating difference
      if (ratingDiff > maxDiff) return false
    }

    return true
  }

  private async createGame(request1: MatchRequest, request2: MatchRequest, userId1: string, userId2: string) {
    // Randomly assign colors
    const isWhite = Math.random() < 0.5
    const whitePlayerId = isWhite ? userId1 : userId2
    const blackPlayerId = isWhite ? userId2 : userId1

    // Parse time control
    const [base, increment] = request1.timeControl.split('+').map(Number)
    const totalTime = base * 60 // Convert to seconds

    const game = await this.prisma.game.create({
      data: {
        status: 'PENDING',
        timeControl: request1.timeControl,
        whiteTimeLeft: totalTime,
        blackTimeLeft: totalTime,
        isRated: request1.isRated,
        whitePlayerId,
        blackPlayerId,
        isPublic: true,
        allowSpectators: true
      }
    })

    this.logger.log(`Created game ${game.id} between ${whitePlayerId} and ${blackPlayerId}`)
    return game
  }

  private async notifyMatchFound(game: any, userId1: string, userId2: string) {
    // Emit WebSocket events
    this.gateway.server.to(userId1).emit('matchFound', {
      gameId: game.id,
      color: game.whitePlayerId === userId1 ? 'white' : 'black',
      opponent: game.whitePlayerId === userId1 ? game.blackPlayerId : game.whitePlayerId,
      timeControl: game.timeControl,
      isRated: game.isRated
    })

    this.gateway.server.to(userId2).emit('matchFound', {
      gameId: game.id,
      color: game.whitePlayerId === userId2 ? 'white' : 'black',
      opponent: game.whitePlayerId === userId2 ? game.blackPlayerId : game.whitePlayerId,
      timeControl: game.timeControl,
      isRated: game.isRated
    })

    // Emit event for game start
    await this.eventBus.emit('game.created', {
      gameId: game.id,
      whitePlayerId: game.whitePlayerId,
      blackPlayerId: game.blackPlayerId,
      timeControl: game.timeControl,
      isRated: game.isRated
    })
  }

  getQueueStatus(): { queueSize: number; users: string[] } {
    return {
      queueSize: this.matchQueue.size,
      users: Array.from(this.matchQueue.keys())
    }
  }
}
