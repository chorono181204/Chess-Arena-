import { Injectable } from '@nestjs/common';
import { HistoryRepository } from './history.repository';
import { HistoryQueryDto } from './dto/history-query.dto';

@Injectable()
export class HistoryService {
  constructor(private readonly historyRepository: HistoryRepository) {}

  async getGameHistory(query: HistoryQueryDto) {
    return this.historyRepository.getGameHistory(query);
  }

  async getUserStats(userId: string, ratingType?: string) {
    return this.historyRepository.getUserStats(userId, ratingType);
  }

  async getRecentGames(userId: string, limit: number = 10) {
    return this.historyRepository.getRecentGames(userId, limit);
  }
}
