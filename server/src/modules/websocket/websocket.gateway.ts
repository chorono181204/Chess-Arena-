import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chess',
})
export class ChessGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChessGateway');
  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(private eventEmitter: EventEmitter2) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Get userId from handshake (assume JWT in query or headers)
    const userId = this.getUserIdFromSocket(client);
    if (userId) {
      this.connectedUsers.set(client.id, userId);
      
      // Emit user connected event
      this.eventEmitter.emit('user.connected', {
        userId,
        socketId: client.id,
      });
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const userId = this.connectedUsers.get(client.id);
    
    if (userId) {
      this.connectedUsers.delete(client.id);
      
      // Emit user disconnected event
      this.eventEmitter.emit('user.disconnected', {
        userId,
        socketId: client.id,
      });
    }
  }

  // ==========================================
  // MATCHMAKING EVENTS
  // ==========================================

  @SubscribeMessage('find-match')
  handleFindMatch(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }

    this.logger.log(`User ${userId} finding match: ${JSON.stringify(data)}`);

    // Emit event to matchmaking service
    this.eventEmitter.emit('matchmaking.find', {
      userId,
      socketId: client.id,
      preferences: data,
    });

    return { event: 'searching', data: { status: 'searching' } };
  }

  @SubscribeMessage('cancel-match')
  handleCancelMatch(@ConnectedSocket() client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    this.logger.log(`User ${userId} cancelled matchmaking`);

    // Emit cancel event
    this.eventEmitter.emit('matchmaking.cancel', {
      userId,
      socketId: client.id,
    });

    return { event: 'cancelled', data: { status: 'cancelled' } };
  }

  // ==========================================
  // GAME EVENTS
  // ==========================================

  @SubscribeMessage('join-game')
  handleJoinGame(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    this.logger.log(`User ${userId} joining game ${data.gameId}`);

    // Join socket room for this game
    client.join(`game:${data.gameId}`);

    // Emit event
    this.eventEmitter.emit('game.join', {
      userId,
      gameId: data.gameId,
      socketId: client.id,
    });

    return { event: 'joined', data: { gameId: data.gameId } };
  }

  @SubscribeMessage('leave-game')
  handleLeaveGame(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    this.logger.log(`User ${userId} leaving game ${data.gameId}`);

    // Leave socket room
    client.leave(`game:${data.gameId}`);

    // Emit event
    this.eventEmitter.emit('game.leave', {
      userId,
      gameId: data.gameId,
      socketId: client.id,
    });
  }

  @SubscribeMessage('make-move')
  handleMakeMove(
    @MessageBody() data: { gameId: string; move: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    this.logger.log(`User ${userId} making move in game ${data.gameId}: ${data.move}`);

    // Emit event to game service
    this.eventEmitter.emit('game.move', {
      userId,
      gameId: data.gameId,
      move: data.move,
      socketId: client.id,
    });
  }

  @SubscribeMessage('send-message')
  handleSendMessage(
    @MessageBody() data: { gameId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    this.logger.log(`User ${userId} sending message in game ${data.gameId}`);

    // Emit event
    this.eventEmitter.emit('game.message', {
      userId,
      gameId: data.gameId,
      content: data.content,
    });
  }

  @SubscribeMessage('resign')
  handleResign(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    this.logger.log(`User ${userId} resigned game ${data.gameId}`);

    // Emit event
    this.eventEmitter.emit('game.resign', {
      userId,
      gameId: data.gameId,
    });
  }

  @SubscribeMessage('offer-draw')
  handleOfferDraw(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    this.logger.log(`User ${userId} offering draw in game ${data.gameId}`);

    // Emit event
    this.eventEmitter.emit('game.draw-offer', {
      userId,
      gameId: data.gameId,
    });
  }

  @SubscribeMessage('accept-draw')
  handleAcceptDraw(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    this.logger.log(`User ${userId} accepting draw in game ${data.gameId}`);

    // Emit event
    this.eventEmitter.emit('game.draw-accept', {
      userId,
      gameId: data.gameId,
    });
  }

  // ==========================================
  // SERVER TO CLIENT EVENTS
  // ==========================================

  emitToUser(userId: string, event: string, data: any) {
    const socketId = Array.from(this.connectedUsers.entries())
      .find(([, uid]) => uid === userId)?.[0];

    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  emitToGame(gameId: string, event: string, data: any) {
    this.server.to(`game:${gameId}`).emit(event, data);
  }

  emitMatchFound(userId: string, data: any) {
    this.emitToUser(userId, 'match-found', data);
  }

  emitGameUpdate(gameId: string, data: any) {
    this.emitToGame(gameId, 'game-update', data);
  }

  emitMoveUpdate(gameId: string, data: any) {
    this.emitToGame(gameId, 'move-made', data);
  }

  emitGameOver(gameId: string, data: any) {
    this.emitToGame(gameId, 'game-over', data);
  }

  emitChatMessage(gameId: string, data: any) {
    this.emitToGame(gameId, 'chat-message', data);
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private getUserIdFromSocket(client: Socket): string | null {
    // Extract userId from JWT token in handshake
    const token = client.handshake.auth.token || client.handshake.query.token;
    
    if (!token) {
      return null;
    }

    // TODO: Verify JWT and extract userId
    // For now, return from query
    return client.handshake.query.userId as string || null;
  }

  getConnectedUsers(): Map<string, string> {
    return this.connectedUsers;
  }

  isUserOnline(userId: string): boolean {
    return Array.from(this.connectedUsers.values()).includes(userId);
  }
}





