import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface MatchmakingJobData {
  userId: string;
  socketId: string;
  preferences: {
    timeControl: string;
    ratingType: string;
    isRated: boolean;
    minRating?: number;
    maxRating?: number;
  };
}

@Injectable()
export class MatchmakingQueue {
  constructor(
    @InjectQueue('matchmaking')
    private matchmakingQueue: Queue<MatchmakingJobData>,
  ) {}

  async addFindMatchJob(data: MatchmakingJobData) {
    return await this.matchmakingQueue.add('find-match', data, {
      priority: 1,
      timeout: 60000, // 60 seconds
    });
  }

  async addCancelMatchJob(userId: string) {
    return await this.matchmakingQueue.add('cancel-match', { userId }, {
      priority: 10, // Higher priority
    });
  }

  async removeUserJobs(userId: string) {
    const jobs = await this.matchmakingQueue.getJobs([
      'waiting',
      'active',
      'delayed',
    ]);

    const userJobs = jobs.filter((job) => job.data.userId === userId);
    
    for (const job of userJobs) {
      await job.remove();
    }
  }

  async getQueueStatus() {
    const waiting = await this.matchmakingQueue.getWaitingCount();
    const active = await this.matchmakingQueue.getActiveCount();
    const completed = await this.matchmakingQueue.getCompletedCount();
    const failed = await this.matchmakingQueue.getFailedCount();

    return {
      waiting,
      active,
      completed,
      failed,
    };
  }
}

