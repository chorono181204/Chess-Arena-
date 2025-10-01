import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger, UseGuards } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { GamesService } from '../games/games.service'
import { GameMatchingService } from '../games/game-matching.service'
import { PrismaService } from '../database/prisma.service'

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string
    username: string
  }
}

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(GameGateway.name)
  private readonly connectedUsers = new Map<string, string>() // userId -> socketId

  constructor(
    private readonly gamesService: GamesService,
    private readonly gameMatchingService: GameMatchingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract user info from token (you'll need to implement JWT verification)
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '')
      
      if (!token) {
        client.disconnect()
        return
      }

      // Verify JWT token and extract user info
      // This is a simplified version - you should use your JWT service
      const user = await this.verifyToken(token)
      
      if (!user) {
        client.disconnect()
        return
      }

      client.data = {
        userId: user.id,
        username: user.username
      }

      this.connectedUsers.set(user.id, client.id)
      this.logger.log(`User ${user.username} connected with socket ${client.id}`)

      // Join user to their personal room
      client.join(user.id)

      // Send connection confirmation
      client.emit('connected', {
        userId: user.id,
        username: user.username
      })

    } catch (error) {
      this.logger.error('Connection error:', error)
      client.disconnect()
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.data?.userId) {
      this.connectedUsers.delete(client.data.userId)
      this.logger.log(`User ${client.data.username} disconnected`)
      
      // Cancel any active matchmaking
      await this.gameMatchingService.cancelMatch(client.data.userId)
    }
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { gameId: string; asSpectator?: boolean }
  ) {
    try {
      const result = await this.gamesService.joinGame(
        data.gameId,
        client.data.userId,
        data.asSpectator || false
      )

      if (result.success) {
        client.join(data.gameId)
        client.emit('joinGameResult', result)
      } else {
        client.emit('joinGameResult', result)
      }
    } catch (error) {
      this.logger.error('Error joining game:', error)
      client.emit('joinGameResult', {
        success: false,
        message: 'Failed to join game'
      })
    }
  }

  @SubscribeMessage('leaveGame')
  async handleLeaveGame(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { gameId: string }
  ) {
    try {
      const result = await this.gamesService.leaveGame(
        data.gameId,
        client.data.userId
      )

      if (result.success) {
        client.leave(data.gameId)
      }

      client.emit('leaveGameResult', result)
    } catch (error) {
      this.logger.error('Error leaving game:', error)
      client.emit('leaveGameResult', {
        success: false,
        message: 'Failed to leave game'
      })
    }
  }

  @SubscribeMessage('makeMove')
  async handleMakeMove(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { gameId: string; from: string; to: string; promotion?: string }
  ) {
    try {
      const result = await this.gamesService.makeMove(
        data.gameId,
        client.data.userId,
        {
          from: data.from,
          to: data.to,
          promotion: data.promotion
        }
      )

      client.emit('moveResult', result)
    } catch (error) {
      this.logger.error('Error making move:', error)
      client.emit('moveResult', {
        success: false,
        message: 'Failed to make move'
      })
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { gameId: string; content: string }
  ) {
    try {
      const result = await this.gamesService.sendMessage(
        data.gameId,
        client.data.userId,
        data.content
      )

      client.emit('messageResult', result)
    } catch (error) {
      this.logger.error('Error sending message:', error)
      client.emit('messageResult', {
        success: false,
        message: 'Failed to send message'
      })
    }
  }

  @SubscribeMessage('requestMatch')
  async handleRequestMatch(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { timeControl: string; isRated: boolean; minRating?: number; maxRating?: number }
  ) {
    try {
      const result = await this.gameMatchingService.requestMatch({
        userId: client.data.userId,
        timeControl: data.timeControl,
        isRated: data.isRated,
        minRating: data.minRating,
        maxRating: data.maxRating
      })

      client.emit('matchRequestResult', result)
    } catch (error) {
      this.logger.error('Error requesting match:', error)
      client.emit('matchRequestResult', {
        success: false,
        message: 'Failed to request match'
      })
    }
  }

  @SubscribeMessage('cancelMatch')
  async handleCancelMatch(
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      const result = await this.gameMatchingService.cancelMatch(client.data.userId)
      client.emit('cancelMatchResult', result)
    } catch (error) {
      this.logger.error('Error canceling match:', error)
      client.emit('cancelMatchResult', {
        success: false,
        message: 'Failed to cancel match'
      })
    }
  }

  @SubscribeMessage('getQueueStatus')
  async handleGetQueueStatus(
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      const status = this.gameMatchingService.getQueueStatus()
      client.emit('queueStatus', status)
    } catch (error) {
      this.logger.error('Error getting queue status:', error)
      client.emit('queueStatus', { queueSize: 0, users: [] })
    }
  }

  // Helper method to verify JWT token
  private async verifyToken(token: string): Promise<{ id: string; username: string } | null> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
      });
      
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, name: true, email: true }
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        username: user.name || user.email
      };
    } catch (error) {
      this.logger.error('Token verification failed:', error);
      return null;
    }
  }

  // Method to get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size
  }

  // Method to get user socket by userId
  getUserSocket(userId: string): Socket | null {
    const socketId = this.connectedUsers.get(userId)
    if (socketId) {
      return this.server.sockets.sockets.get(socketId) || null
    }
    return null
  }
}

export { GameGateway as WebSocketGateway }