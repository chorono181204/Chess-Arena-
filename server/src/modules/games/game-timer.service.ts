import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { EventBusService } from '../events/event-bus.service'
import { WebSocketGateway } from '../websocket/game.gateway'

export interface TimerState {
  gameId: string
  whiteTimeLeft: number
  blackTimeLeft: number
  currentTurn: 'white' | 'black'
  isActive: boolean
}

@Injectable()
export class GameTimerService {
  private readonly logger = new Logger(GameTimerService.name)
  private readonly activeTimers = new Map<string, NodeJS.Timeout>()
  private readonly timerStates = new Map<string, TimerState>()

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly gateway: WebSocketGateway,
  ) {}

  async startTimer(gameId: string): Promise<void> {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id: gameId }
      })

      if (!game || game.status !== 'ACTIVE') {
        return
      }

      // Parse time control
      const [base, increment] = game.timeControl.split('+').map(Number)
      const totalTime = base * 60 // Convert to seconds

      // Initialize timer state
      const timerState: TimerState = {
        gameId,
        whiteTimeLeft: game.whiteTimeLeft || totalTime,
        blackTimeLeft: game.blackTimeLeft || totalTime,
        currentTurn: game.turn.toLowerCase() as 'white' | 'black',
        isActive: true
      }

      this.timerStates.set(gameId, timerState)

      // Start the timer
      this.startCountdown(gameId)

      this.logger.log(`Timer started for game ${gameId}`)
    } catch (error) {
      this.logger.error('Error starting timer:', error)
    }
  }

  async stopTimer(gameId: string): Promise<void> {
    try {
      const timer = this.activeTimers.get(gameId)
      if (timer) {
        clearInterval(timer)
        this.activeTimers.delete(gameId)
      }

      const timerState = this.timerStates.get(gameId)
      if (timerState) {
        timerState.isActive = false
      }

      this.logger.log(`Timer stopped for game ${gameId}`)
    } catch (error) {
      this.logger.error('Error stopping timer:', error)
    }
  }

  async pauseTimer(gameId: string): Promise<void> {
    try {
      const timer = this.activeTimers.get(gameId)
      if (timer) {
        clearInterval(timer)
        this.activeTimers.delete(gameId)
      }

      const timerState = this.timerStates.get(gameId)
      if (timerState) {
        timerState.isActive = false
      }

      this.logger.log(`Timer paused for game ${gameId}`)
    } catch (error) {
      this.logger.error('Error pausing timer:', error)
    }
  }

  async resumeTimer(gameId: string): Promise<void> {
    try {
      const timerState = this.timerStates.get(gameId)
      if (timerState && !timerState.isActive) {
        timerState.isActive = true
        this.startCountdown(gameId)
        this.logger.log(`Timer resumed for game ${gameId}`)
      }
    } catch (error) {
      this.logger.error('Error resuming timer:', error)
    }
  }

  async switchTurn(gameId: string): Promise<void> {
    try {
      const timerState = this.timerStates.get(gameId)
      if (!timerState) return

      // Switch turn
      timerState.currentTurn = timerState.currentTurn === 'white' ? 'black' : 'white'

      // Update database
      await this.prisma.game.update({
        where: { id: gameId },
        data: {
          turn: timerState.currentTurn.toUpperCase() as 'WHITE' | 'BLACK',
          whiteTimeLeft: timerState.whiteTimeLeft,
          blackTimeLeft: timerState.blackTimeLeft
        }
      })

      // Emit turn change event
      this.gateway.server.to(gameId).emit('turnChanged', {
        gameId,
        turn: timerState.currentTurn,
        whiteTimeLeft: timerState.whiteTimeLeft,
        blackTimeLeft: timerState.blackTimeLeft
      })

      this.logger.log(`Turn switched to ${timerState.currentTurn} for game ${gameId}`)
    } catch (error) {
      this.logger.error('Error switching turn:', error)
    }
  }

  getTimerState(gameId: string): TimerState | null {
    return this.timerStates.get(gameId) || null
  }

  private startCountdown(gameId: string): void {
    const timer = setInterval(async () => {
      try {
        const timerState = this.timerStates.get(gameId)
        if (!timerState || !timerState.isActive) {
          clearInterval(timer)
          this.activeTimers.delete(gameId)
          return
        }

        // Decrease time for current turn
        if (timerState.currentTurn === 'white') {
          timerState.whiteTimeLeft--
        } else {
          timerState.blackTimeLeft--
        }

        // Check for time out
        if (timerState.whiteTimeLeft <= 0 || timerState.blackTimeLeft <= 0) {
          await this.handleTimeOut(gameId, timerState)
          clearInterval(timer)
          this.activeTimers.delete(gameId)
          return
        }

        // Emit timer update
        this.gateway.server.to(gameId).emit('timerUpdate', {
          gameId,
          whiteTimeLeft: timerState.whiteTimeLeft,
          blackTimeLeft: timerState.blackTimeLeft,
          currentTurn: timerState.currentTurn
        })

        // Update database every 10 seconds
        if (timerState.whiteTimeLeft % 10 === 0 || timerState.blackTimeLeft % 10 === 0) {
          await this.prisma.game.update({
            where: { id: gameId },
            data: {
              whiteTimeLeft: timerState.whiteTimeLeft,
              blackTimeLeft: timerState.blackTimeLeft
            }
          })
        }

      } catch (error) {
        this.logger.error('Error in timer countdown:', error)
        clearInterval(timer)
        this.activeTimers.delete(gameId)
      }
    }, 1000)

    this.activeTimers.set(gameId, timer)
  }

  private async handleTimeOut(gameId: string, timerState: TimerState): Promise<void> {
    try {
      // Determine winner based on who ran out of time
      const winner = timerState.whiteTimeLeft <= 0 ? 'BLACK' : 'WHITE'
      const loser = timerState.whiteTimeLeft <= 0 ? 'WHITE' : 'BLACK'

      // Update game in database
      const game = await this.prisma.game.update({
        where: { id: gameId },
        data: {
          status: 'COMPLETED',
          winnerColor: winner as 'WHITE' | 'BLACK',
          endedAt: new Date()
        },
        include: {
          whitePlayer: true,
          blackPlayer: true
        }
      })

      // Update player ratings if rated game
      if (game.isRated) {
        await this.updatePlayerRatings(game, winner, loser)
      }

      // Emit time out event
      this.gateway.server.to(gameId).emit('timeOut', {
        gameId,
        winner,
        loser,
        reason: 'timeout'
      })

      // Emit game ended event
      await this.eventBus.emit('game.ended', {
        gameId,
        winner,
        reason: 'timeout'
      })

      this.logger.log(`Time out in game ${gameId}, ${winner} wins`)

    } catch (error) {
      this.logger.error('Error handling time out:', error)
    }
  }

  private async updatePlayerRatings(game: any, winner: string, loser: string): Promise<void> {
    try {
      // Simple ELO rating system
      const kFactor = 32
      const whitePlayer = game.whitePlayer
      const blackPlayer = game.blackPlayer

      if (!whitePlayer || !blackPlayer) return

      const expectedWhite = 1 / (1 + Math.pow(10, (blackPlayer.rating - whitePlayer.rating) / 400))
      const expectedBlack = 1 / (1 + Math.pow(10, (whitePlayer.rating - blackPlayer.rating) / 400))

      let whiteScore = 0
      let blackScore = 0

      if (winner === 'WHITE') {
        whiteScore = 1
        blackScore = 0
      } else if (winner === 'BLACK') {
        whiteScore = 0
        blackScore = 1
      }

      const newWhiteRating = Math.round(whitePlayer.rating + kFactor * (whiteScore - expectedWhite))
      const newBlackRating = Math.round(blackPlayer.rating + kFactor * (blackScore - expectedBlack))

      await this.prisma.user.update({
        where: { id: whitePlayer.id },
        data: { 
          rating: newWhiteRating,
          wins: winner === 'WHITE' ? whitePlayer.wins + 1 : whitePlayer.wins,
          losses: winner === 'WHITE' ? whitePlayer.losses : whitePlayer.losses + 1
        }
      })

      await this.prisma.user.update({
        where: { id: blackPlayer.id },
        data: { 
          rating: newBlackRating,
          wins: winner === 'BLACK' ? blackPlayer.wins + 1 : blackPlayer.wins,
          losses: winner === 'BLACK' ? blackPlayer.losses : blackPlayer.losses + 1
        }
      })

      this.logger.log(`Updated ratings: White ${newWhiteRating}, Black ${newBlackRating}`)
    } catch (error) {
      this.logger.error('Error updating player ratings:', error)
    }
  }

  async cleanup(): Promise<void> {
    // Clear all timers
    for (const [gameId, timer] of this.activeTimers) {
      clearInterval(timer)
    }
    this.activeTimers.clear()
    this.timerStates.clear()
  }
}


