import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RedisService } from '@providers/redis';
import { MatchmakingQueue } from '@modules/queues/services/matchmaking-queue.service';
import { PrismaService } from '@providers/prisma';
import { ChessGateway } from '@modules/websocket/websocket.gateway';
import { randomUUID } from 'crypto';

@Injectable()
export class MatchmakingEventListener {
  private readonly logger = new Logger(MatchmakingEventListener.name);

  constructor(
    private readonly redis: RedisService,
    private readonly matchmakingQueue: MatchmakingQueue,
    private readonly prisma: PrismaService,
    private readonly gateway: ChessGateway,
  ) {}

  @OnEvent('matchmaking.find')
  async handleMatchmakingFind(payload: any) {
    this.logger.log(`User ${payload.userId} looking for match`);
    this.logger.log(`Payload received:`, payload);
    this.logger.log(`Preferences extracted:`, payload.preferences);
    
    await this.matchmakingQueue.addFindMatchJob({
      userId: payload.userId,
      socketId: payload.socketId,
      preferences: payload.preferences,
    });
  }

  @OnEvent('matchmaking.cancel')
  async handleMatchmakingCancel(payload: any) {
    this.logger.log(`User ${payload.userId} cancelled matchmaking`);
    await this.matchmakingQueue.removeUserJobs(payload.userId);
  }

  @OnEvent('matchmaking.matched')
  async handleMatchmakingMatched(payload: any) {
    this.logger.log(`Match found: ${payload.player1.userId} vs ${payload.player2.userId}`);
    const proposalId = randomUUID();
    const key = `match:proposal:${proposalId}`;
    await this.redis.save({ key, value: JSON.stringify(payload), expireInSeconds: 3000 });
    this.gateway.emitMatchFound(payload.player1.userId, { proposalId, opponentId: payload.player2.userId, preferences: payload.player1.preferences });
    this.gateway.emitMatchFound(payload.player2.userId, { proposalId, opponentId: payload.player1.userId, preferences: payload.player2.preferences });
  }

  @OnEvent('matchmaking.expand-search')
  handleExpandSearch(payload: any) {
    this.logger.log(`Expanding search for user ${payload.userId}`);
    // custom expand logic handled in processor
  }

  @OnEvent('matchmaking.accept')
  async handleAccept(payload: { userId: string; proposalId: string }) {
    const key = `match:proposal:${payload.proposalId}`;
    const stateKey = `${key}:state`;
    const data = await this.redis.get(key);
    if (!data) {
      this.logger.warn(`Proposal not found or expired: ${payload.proposalId}`);
      return;
    }
    const stateRaw = (await this.redis.get(stateKey)) || '{}';
    const state = JSON.parse(stateRaw);
    state[payload.userId] = 'accepted';
    await this.redis.save({ key: stateKey, value: JSON.stringify(state), expireInSeconds: 30 });

    const { player1, player2 } = JSON.parse(data);
    this.logger.log(`Accept state for ${payload.proposalId}:`, state);

    if (state[player1.userId] === 'accepted' && state[player2.userId] === 'accepted') {
      try {
        const { minutes, increment } = this.parseTimeControl(player1.preferences.timeControl);
        const isRated = !!player1.preferences.isRated;
        const assignWhiteToP1 = Math.random() < 0.5;
        const whitePlayerId = assignWhiteToP1 ? player1.userId : player2.userId;
        const blackPlayerId = assignWhiteToP1 ? player2.userId : player1.userId;

        this.logger.log(`Creating game for proposal ${payload.proposalId} | white=${whitePlayerId} black=${blackPlayerId}`);
        const game = await this.prisma.game.create({
          data: {
            status: 'ACTIVE',
            gameType: isRated ? 'RATED' : 'CASUAL',
            timeControl: player1.preferences.timeControl,
            isRated,
            whitePlayerId,
            blackPlayerId,
            whiteTimeLeft: minutes * 60000,
            blackTimeLeft: minutes * 60000,
            timeIncrement: increment * 1000,
            startedAt: new Date(),
          },
        });

        this.logger.log(`Game created: ${game.id} | notifying players`);
        this.gateway.emitToUser(player1.userId, 'game-start', { gameId: game.id });
        this.gateway.emitToUser(player2.userId, 'game-start', { gameId: game.id });
        await this.redis.deleteMany([key, stateKey]);
      } catch (err: any) {
        this.logger.error(`Failed to create game for proposal ${payload.proposalId}: ${err?.message}`);
        // Notify both users about error (optional)
        this.gateway.emitToUser(player1.userId, 'match-error', { message: 'Failed to create game' });
        this.gateway.emitToUser(player2.userId, 'match-error', { message: 'Failed to create game' });
      }
    }
  }

  @OnEvent('matchmaking.decline')
  async handleDecline(payload: { userId: string; proposalId: string }) {
    const key = `match:proposal:${payload.proposalId}`;
    const data = await this.redis.get(key);
    if (!data) {
      this.logger.warn(`Proposal not found or expired (decline): ${payload.proposalId}`);
      return;
    }
    const { player1, player2 } = JSON.parse(data);
    const other = payload.userId === player1.userId ? player2 : player1;
    this.gateway.emitToUser(other.userId, 'match-declined', { by: payload.userId });
    await this.matchmakingQueue.addFindMatchJob(other);
    await this.redis.delete(key);
    await this.redis.delete(`${key}:state`);
  }

  private parseTimeControl(tc: string): { minutes: number; increment: number } {
    const [m, i] = String(tc).split('+').map((x) => parseInt(x, 10));
    return { minutes: m || 10, increment: i || 0 };
  }
}





