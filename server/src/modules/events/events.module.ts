import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GameEventListener } from './listeners/game-event.listener';
import { MatchmakingEventListener } from './listeners/matchmaking-event.listener';
import { UserEventListener } from './listeners/user-event.listener';
import { RedisModule } from '@providers/redis';
import { QueueModule } from '@modules/queues/queue.module';
import { WebSocketModule } from '@modules/websocket/websocket.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
    // Needed for DI in MatchmakingEventListener
    RedisModule,
    QueueModule,
    WebSocketModule,
  ],
  providers: [
    GameEventListener,
    MatchmakingEventListener,
    UserEventListener,
  ],
  exports: [EventEmitterModule],
})
export class EventsModule {}





