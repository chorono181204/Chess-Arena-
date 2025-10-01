import { Module } from '@nestjs/common'
import { PrismaModule } from '../database/prisma.module'
import { EventsModule } from '../events/events.module'
import { WebsocketModule } from '../websocket/websocket.module'
import { GamesService } from './games.service'
import { GameMatchingService } from './game-matching.service'
import { GameTimerService } from './game-timer.service'
import { GamesController } from './games.controller'

@Module({
  imports: [PrismaModule, EventsModule, WebsocketModule],
  providers: [GamesService, GameMatchingService, GameTimerService],
  controllers: [GamesController],
  exports: [GamesService, GameMatchingService, GameTimerService],
})
export class GamesModule {}
