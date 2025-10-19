import { Injectable } from '@nestjs/common';
import { LeaderboardRepository } from './leaderboard.repository';
import { LeaderboardQueryDto, RatingType } from './dto/leaderboard-query.dto';

@Injectable()
export class LeaderboardService {
  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  async getLeaderboard(query: LeaderboardQueryDto) {
    return this.leaderboardRepository.getLeaderboard(query);
  }

  async getUserRanking(userId: string, ratingType: RatingType) {
    return this.leaderboardRepository.getUserRanking(userId, ratingType);
  }

  async getTopPlayers(ratingType: RatingType, limit: number = 10) {
    return this.leaderboardRepository.getTopPlayers(ratingType, limit);
  }
}
