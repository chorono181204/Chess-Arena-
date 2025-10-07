import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UserEventListener {
  private readonly logger = new Logger(UserEventListener.name);

  @OnEvent('user.connected')
  handleUserConnected(payload: any) {
    this.logger.log(`User ${payload.userId} connected via WebSocket`);
    
    // TODO: Handle user connection
    // - Update online status
    // - Send pending notifications
    // - Resume active games
  }

  @OnEvent('user.disconnected')
  handleUserDisconnected(payload: any) {
    this.logger.log(`User ${payload.userId} disconnected`);
    
    // TODO: Handle user disconnection
    // - Update online status
    // - Handle active games
    // - Set timeout for reconnection
  }
}





