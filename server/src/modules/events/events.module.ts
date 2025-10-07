import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GameEventListener } from './listeners/game-event.listener';
import { MatchmakingEventListener } from './listeners/matchmaking-event.listener';
import { UserEventListener } from './listeners/user-event.listener';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
  ],
  providers: [
    GameEventListener,
    MatchmakingEventListener,
    UserEventListener,
  ],
  exports: [EventEmitterModule],
})
export class EventsModule {}





