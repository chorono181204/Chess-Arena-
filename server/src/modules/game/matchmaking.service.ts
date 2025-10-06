import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@providers/prisma';
import { MatchmakingQueue } from '@modules/queues/services/matchmaking-queue.service';

@Injectable()
export class MatchmakingService {
  private readonly logger = new Logger(MatchmakingService.name);

  constructor(
    private prisma: PrismaService,
    private matchmakingQueue: MatchmakingQueue,
  ) {}

  // TODO: Implement matchmaking logic here

  async findQuickMatch(userId: string, preferences: any) {
    this.logger.log(`Finding quick match for user ${userId}`);
    
    // TODO:
    // 1. Get user rating
    // 2. Find waiting game with similar rating
    // 3. If found, join game
    // 4. If not found, create new waiting game
    // 5. Or add to matchmaking queue
    
    return null;
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
}





