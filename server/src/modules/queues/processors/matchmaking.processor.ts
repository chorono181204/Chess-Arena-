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
    this.logger.log(`User preferences:`, {
      timeControl: preferences.timeControl,
      ratingType: preferences.ratingType,
      isRated: preferences.isRated,
      minRating: preferences.minRating,
      maxRating: preferences.maxRating,
    });

    // Get or create pool for this time control + rating type
    const poolKey = `${preferences.timeControl}-${preferences.ratingType}`;
    this.logger.log(`Pool key: ${poolKey}`);
    
    if (!this.matchmakingPool.has(poolKey)) {
      this.matchmakingPool.set(poolKey, []);
      this.logger.log(`Created new pool for key: ${poolKey}`);
    }

    const pool = this.matchmakingPool.get(poolKey);
    this.logger.log(`Pool contents for ${poolKey}:`, pool.map(p => ({
      userId: p.userId,
      timeControl: p.preferences.timeControl,
      ratingType: p.preferences.ratingType,
      isRated: p.preferences.isRated,
      minRating: p.preferences.minRating,
      maxRating: p.preferences.maxRating,
    })));

    // Cleanup expired entries (> 60s)
    const now = Date.now();
    const MAX_WAIT_MS = 60_000;
    for (let i = pool.length - 1; i >= 0; i--) {
      const item: any = pool[i] as any;
      if (item.__ts && now - item.__ts > MAX_WAIT_MS) {
        pool.splice(i, 1);
      }
    }

    // Try to find a match in the pool using interval overlap
    const match = pool.find((candidate) => {
      this.logger.debug(`Checking candidate ${candidate.userId}:`, {
        candidateTimeControl: candidate.preferences.timeControl,
        candidateRatingType: candidate.preferences.ratingType,
        candidateIsRated: candidate.preferences.isRated,
        userTimeControl: preferences.timeControl,
        userRatingType: preferences.ratingType,
        userIsRated: preferences.isRated,
      });

      if (candidate.userId === userId) {
        this.logger.debug(`Skipping self: ${candidate.userId}`);
        return false;
      }
      if (candidate.preferences.timeControl !== preferences.timeControl) {
        this.logger.debug(`TimeControl mismatch: ${candidate.preferences.timeControl} vs ${preferences.timeControl}`);
        return false;
      }
      if (candidate.preferences.ratingType !== preferences.ratingType) {
        this.logger.debug(`RatingType mismatch: ${candidate.preferences.ratingType} vs ${preferences.ratingType}`);
        return false;
      }
      if (candidate.preferences.isRated !== preferences.isRated) {
        this.logger.debug(`IsRated mismatch: ${candidate.preferences.isRated} vs ${preferences.isRated}`);
        return false;
      }

      // Elo window overlap check
      const aMin = preferences.minRating ?? 1100;
      const aMax = preferences.maxRating ?? 1300;
      const bMin = candidate.preferences.minRating ?? 1100;
      const bMax = candidate.preferences.maxRating ?? 1300;
      const overlap = Math.max(0, Math.min(aMax, bMax) - Math.max(aMin, bMin));
      
      this.logger.debug(`Elo check: user[${aMin}-${aMax}] vs candidate[${bMin}-${bMax}], overlap=${overlap}`);
      return overlap >= 1;
    });

    if (match) {
      // Match found! Remove from pool
      const index = pool.indexOf(match);
      pool.splice(index, 1);

      this.logger.log(`Match found: ${userId} vs ${match.userId}`);
      this.logger.log(`Match details:`, {
        poolKey,
        userPreferences: preferences,
        matchPreferences: match.preferences,
      });

      // Emit match found event
      this.eventEmitter.emit('matchmaking.matched', {
        player1: job.data,
        player2: match,
      });

      return { matched: true, opponent: match };
    } else {
      // No match found, add to pool with timestamp
      (job.data as any).__ts = now;
      pool.push(job.data);

      this.logger.log(`No match found for ${userId}, added to pool. Pool size: ${pool.length}`);

      // Schedule periodic expansion (every 10s)
      setTimeout(() => {
        this.expandSearch(userId, poolKey);
      }, 10_000);

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

    // Expand rating range with caps (±400 from center)
    const center = ((user.preferences.minRating ?? 1200) + (user.preferences.maxRating ?? 1200)) / 2;
    const currentMin = user.preferences.minRating ?? Math.floor(center - 100);
    const currentMax = user.preferences.maxRating ?? Math.ceil(center + 100);
    const nextMin = currentMin - 100;
    const nextMax = currentMax + 100;
    user.preferences.minRating = Math.max(center - 400, nextMin);
    user.preferences.maxRating = Math.min(center + 400, nextMax);

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

