import { Module } from '@nestjs/common'
import { PrismaModule } from '../database/prisma.module'
import { EventsModule } from '../events/events.module'
import { WebsocketModule } from '../websocket/websocket.module'
import { LobbyService } from './lobby.service'
import { LobbyController } from './lobby.controller'

@Module({
  imports: [PrismaModule, EventsModule, WebsocketModule],
  providers: [LobbyService],
  controllers: [LobbyController],
  exports: [LobbyService],
})
export class LobbyModule {}







