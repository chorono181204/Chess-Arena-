import { Module } from '@nestjs/common';
import { ChessGateway } from './websocket.gateway';

@Module({
  providers: [ChessGateway],
  exports: [ChessGateway],
})
export class WebSocketModule {}





