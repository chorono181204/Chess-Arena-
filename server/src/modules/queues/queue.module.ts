import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MatchmakingProcessor } from './processors/matchmaking.processor';
import { GameProcessor } from './processors/game.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { MatchmakingQueue } from './services/matchmaking-queue.service';
import { GameQueue } from './services/game-queue.service';
import { NotificationQueue } from './services/notification-queue.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: 'matchmaking',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      },
      {
        name: 'game',
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 200,
          removeOnFail: 100,
        },
      },
      {
        name: 'notification',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1500,
          },
          removeOnComplete: 50,
          removeOnFail: 25,
        },
      },
    ),
  ],
  providers: [
    MatchmakingProcessor,
    GameProcessor,
    NotificationProcessor,
    MatchmakingQueue,
    GameQueue,
    NotificationQueue,
  ],
  exports: [
    MatchmakingQueue,
    GameQueue,
    NotificationQueue,
    BullModule,
  ],
})
export class QueueModule {}





