import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class MatchmakingEventListener {
  private readonly logger = new Logger(MatchmakingEventListener.name);

  @OnEvent('matchmaking.find')
  handleMatchmakingFind(payload: any) {
    this.logger.log(`User ${payload.userId} looking for match`);
    
    // TODO: Add to matchmaking queue
    // await this.matchmakingQueue.addFindMatchJob(payload);
  }

  @OnEvent('matchmaking.cancel')
  handleMatchmakingCancel(payload: any) {
    this.logger.log(`User ${payload.userId} cancelled matchmaking`);
    
    // TODO: Remove from matchmaking queue
    // await this.matchmakingQueue.removeUserJobs(payload.userId);
  }

  @OnEvent('matchmaking.matched')
  handleMatchmakingMatched(payload: any) {
    this.logger.log(`Match found: ${payload.player1.userId} vs ${payload.player2.userId}`);
    
    // TODO: Create game
    // - Create game in database
    // - Notify both players via WebSocket
    // - Start game timer
  }

  @OnEvent('matchmaking.expand-search')
  handleExpandSearch(payload: any) {
    this.logger.log(`Expanding search for user ${payload.userId}`);
    
    // TODO: Expand search criteria
  }
}





