import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MatchmakingJobData } from '../services/matchmaking-queue.service';

@Processor('matchmaking')
export class MatchmakingProcessor {
  private readonly logger = new Logger(MatchmakingProcessor.name);
  private matchmakingPool = new Map<string, MatchmakingJobData[]>();

  constructor(private eventEmitter: EventEmitter2) {}

  @Process('find-match')
  async handleFindMatch(job: Job<MatchmakingJobData>) {
    const { userId, preferences } = job.data;

    this.logger.log(`Processing find-match for user ${userId}`);

    // Get or create pool for this time control + rating type
    const poolKey = `${preferences.timeControl}-${preferences.ratingType}`;
    
    if (!this.matchmakingPool.has(poolKey)) {
      this.matchmakingPool.set(poolKey, []);
    }

    const pool = this.matchmakingPool.get(poolKey);

    // Try to find a match in the pool
    const match = pool.find((candidate) => {
      // Check if candidate is compatible
      if (candidate.userId === userId) return false;
      if (candidate.preferences.isRated !== preferences.isRated) return false;

      // Rating range check
      const userRating = preferences.minRating || 1200;
      const candidateRating = candidate.preferences.minRating || 1200;
      const ratingDiff = Math.abs(userRating - candidateRating);

      return ratingDiff <= 200; // Max rating difference
    });

    if (match) {
      // Match found! Remove from pool
      const index = pool.indexOf(match);
      pool.splice(index, 1);

      this.logger.log(`Match found: ${userId} vs ${match.userId}`);

      // Emit match found event
      this.eventEmitter.emit('matchmaking.matched', {
        player1: job.data,
        player2: match,
      });

      return { matched: true, opponent: match };
    } else {
      // No match found, add to pool
      pool.push(job.data);

      this.logger.log(`No match found for ${userId}, added to pool. Pool size: ${pool.length}`);

      // Set timeout to expand search after 30 seconds
      setTimeout(() => {
        this.expandSearch(userId, poolKey);
      }, 30000);

      return { matched: false, poolSize: pool.length };
    }
  }

  @Process('cancel-match')
  async handleCancelMatch(job: Job<{ userId: string }>) {
    const { userId } = job.data;

    this.logger.log(`Cancelling match for user ${userId}`);

    // Remove from all pools
    for (const [poolKey, pool] of this.matchmakingPool.entries()) {
      const index = pool.findIndex((item) => item.userId === userId);
      if (index !== -1) {
        pool.splice(index, 1);
        this.logger.log(`Removed ${userId} from pool ${poolKey}`);
      }
    }

    return { cancelled: true };
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.debug(`Completed job ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}: ${err.message}`);
  }

  private expandSearch(userId: string, poolKey: string) {
    const pool = this.matchmakingPool.get(poolKey);
    if (!pool) return;

    const user = pool.find((item) => item.userId === userId);
    if (!user) return;

    this.logger.log(`Expanding search for ${userId}`);

    // Expand rating range
    if (user.preferences.minRating) {
      user.preferences.minRating -= 100;
    }
    if (user.preferences.maxRating) {
      user.preferences.maxRating += 100;
    }

    // Try to find match again with expanded range
    this.eventEmitter.emit('matchmaking.expand-search', { userId });
  }

  getPoolStatus() {
    const status: any = {};
    for (const [key, pool] of this.matchmakingPool.entries()) {
      status[key] = pool.length;
    }
    return status;
  }
}

