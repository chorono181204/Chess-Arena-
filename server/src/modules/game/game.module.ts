import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { MatchmakingService } from './matchmaking.service';
import { PrismaModule } from '@providers/prisma';
import { QueueModule } from '@modules/queues/queue.module';
import { WebSocketModule } from '@modules/websocket/websocket.module';

@Module({
  imports: [PrismaModule, QueueModule, WebSocketModule],
  controllers: [GameController],
  providers: [GameService, MatchmakingService],
  exports: [GameService, MatchmakingService],
})
export class GameModule {}





