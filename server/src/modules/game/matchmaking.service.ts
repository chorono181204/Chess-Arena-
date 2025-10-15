import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@providers/prisma';
import { MatchmakingQueue } from '@modules/queues/services/matchmaking-queue.service';
import { RatingType } from '@prisma/client';
import { ChessGateway } from '@modules/websocket/websocket.gateway';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MatchmakingService {
  private readonly logger = new Logger(MatchmakingService.name);

  constructor(
    private prisma: PrismaService,
    private matchmakingQueue: MatchmakingQueue,
    private readonly gateway: ChessGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // TODO: Implement matchmaking logic here

  async findQuickMatch(userId: string, preferences: any) {
    this.logger.log(`Finding quick match for user ${userId}`);

    const timeControl: string = preferences?.timeControl;
    const ratingType: RatingType = this.parseRatingType(preferences?.ratingType);
    const isRated: boolean = !!preferences?.isRated;
    const socketId: string | undefined = preferences?.socketId;

    if (!timeControl || !ratingType) {
      throw new Error('timeControl và ratingType là bắt buộc');
    }

    // 1) Lấy rating người chơi theo ratingType
    const userRatingRecord = await this.prisma.rating.findUnique({
      where: {
        userId_ratingType: { userId, ratingType },
      },
      select: { rating: true },
    });
    const baseRating = userRatingRecord?.rating ?? 1200;

    // Dải ELO ban đầu (có thể đến từ UI, fallback ±100)
    const minRating: number =
      typeof preferences?.minRating === 'number' ? preferences.minRating : baseRating - 100;
    const maxRating: number =
      typeof preferences?.maxRating === 'number' ? preferences.maxRating : baseRating + 100;

    // 2) Tìm phòng chờ phù hợp (theo timeControl/isRated). Lấy ra vài phòng, lọc tiếp theo rating creator
    const candidates = await this.prisma.game.findMany({
      where: {
        status: 'WAITING',
        timeControl,
        isRated,
        whitePlayerId: { not: userId },
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
      select: {
        id: true,
        whitePlayerId: true,
      },
    });

    let chosen: { id: string; whitePlayerId: string } | null = null;
    for (const g of candidates) {
      const creatorRating = await this.prisma.rating.findUnique({
        where: { userId_ratingType: { userId: g.whitePlayerId, ratingType } },
        select: { rating: true },
      });
      const oppRating = creatorRating?.rating ?? 1200;
      if (oppRating >= minRating && oppRating <= maxRating) {
        chosen = { id: g.id, whitePlayerId: g.whitePlayerId };
        break;
      }
    }

    // 3) Nếu có game chờ phù hợp → KHÔNG activate ngay; phát event matched để đi qua accept/decline
    if (chosen) {
      this.eventEmitter.emit('matchmaking.matched', {
        player1: {
          userId,
          preferences: { timeControl, ratingType, isRated, minRating, maxRating },
        },
        player2: {
          userId: chosen.whitePlayerId,
          preferences: { timeControl, ratingType, isRated, minRating, maxRating },
        },
        waitingGameId: chosen.id,
      });

      // Phản hồi ngay cho HTTP, WS sẽ lo phần tiếp theo
      return { matched: false, waitingGameId: chosen.id, queued: false };
    }

    // 4) Không có game phù hợp → tạo phòng chờ
    const { minutes, increment } = this.parseTimeControl(timeControl);
    const waiting = await this.prisma.game.create({
      data: {
        status: 'WAITING',
        gameType: isRated ? 'RATED' : 'CASUAL',
        timeControl,
        isRated,
        whitePlayerId: userId,
        whiteTimeLeft: minutes * 60000,
        blackTimeLeft: minutes * 60000,
        timeIncrement: increment * 1000,
      },
    });

    // 5) Thêm vào hàng đợi để tiếp tục mở rộng tìm kiếm trong nền (event-driven)
    await this.matchmakingQueue.addFindMatchJob({
      userId,
      socketId: socketId || '',
      preferences: {
        timeControl,
        ratingType,
        isRated,
        minRating,
        maxRating,
      },
    });

    return { matched: false, waitingGameId: waiting.id, queued: true };
  }

  async cancelMatchmaking(userId: string) {
    this.logger.log(`Cancelling matchmaking for user ${userId}`);
    
    // TODO: Remove from queue and cancel waiting games
    await this.matchmakingQueue.removeUserJobs(userId);
    
    return { cancelled: true };
  }

  async createCustomGame(userId: string, options: any) {
    this.logger.log(`Creating custom game for user ${userId}`);
    
    // TODO: Create custom game
    
    return null;
  }

  async getWaitingGames(filters: any) {
    this.logger.log('Getting waiting games');
    
    // TODO: Get list of games waiting for players
    
    return [];
  }

  async calculateRatingChange(
    playerRating: number,
    opponentRating: number,
    result: number,
  ) {
    // TODO: Implement ELO rating calculation
    // Formula: newRating = oldRating + K * (actualScore - expectedScore)
    // expectedScore = 1 / (1 + 10^((opponentRating - playerRating) / 400))
    
    const K = 32; // K-factor
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    const ratingChange = Math.round(K * (result - expectedScore));
    
    return ratingChange;
  }

  private parseTimeControl(tc: string): { minutes: number; increment: number } {
    const parts = tc.split('+');
    const minutes = parseInt(parts[0], 10) || 10;
    const increment = parseInt(parts[1] || '0', 10) || 0;
    return { minutes, increment };
  }

  private parseRatingType(input: any): RatingType {
    switch (String(input || '').toUpperCase()) {
      case 'BULLET':
        return 'BULLET';
      case 'BLITZ':
        return 'BLITZ';
      case 'RAPID':
        return 'RAPID';
      case 'CLASSIC':
      case 'CLASSICAL':
        return 'CLASSIC';
      default:
        return 'RAPID';
    }
  }
}





