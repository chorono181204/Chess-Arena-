import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './modules/database/prisma.module'
import { EventsModule } from './modules/events/events.module'
import { WebsocketModule } from './modules/websocket/websocket.module'
import { GamesModule } from './modules/games/games.module'
import { LobbyModule } from './modules/lobby/lobby.module'
import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    EventsModule,
    WebsocketModule,
    GamesModule,
    LobbyModule,
    AuthModule,
  ],
})
export class AppModule {}