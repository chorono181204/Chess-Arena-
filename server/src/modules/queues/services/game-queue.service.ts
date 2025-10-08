import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface GameJobData {
  gameId: string;
  userId: string;
  action: string;
  data?: any;
}

@Injectable()
export class GameQueue {
  constructor(
    @InjectQueue('game')
    private gameQueue: Queue<GameJobData>,
  ) {}

  async addProcessMoveJob(data: {
    gameId: string;
    userId: string;
    move: string;
  }) {
    return await this.gameQueue.add(
      'process-move',
      { ...data, action: 'process-move' },
      {
      priority: 1,
      },
    );
  }

  async addUpdateRatingJob(data: { gameId: string; userId: string }) {
    return await this.gameQueue.add(
      'update-rating',
      { ...data, action: 'update-rating' },
      {
      priority: 5,
      delay: 1000, // Wait 1 second after game ends
      },
    );
  }

  async addCleanupGameJob(data: { gameId: string; userId: string }) {
    return await this.gameQueue.add(
      'cleanup-game',
      { ...data, action: 'cleanup-game' },
      {
      priority: 10,
      delay: 300000, // Wait 5 minutes after game ends
      },
    );
  }

  async addCheckTimeoutJob(data: { gameId: string; userId: string }) {
    return await this.gameQueue.add(
      'check-timeout',
      { ...data, action: 'check-timeout' },
      {
      priority: 2,
      repeat: {
        every: 1000, // Check every second
      },
      },
    );
  }

  async removeGameJobs(gameId: string) {
    const jobs = await this.gameQueue.getJobs([
      'waiting',
      'active',
      'delayed',
      'paused',
    ]);

    const gameJobs = jobs.filter((job) => job.data.gameId === gameId);
    
    for (const job of gameJobs) {
      await job.remove();
    }
  }
}





