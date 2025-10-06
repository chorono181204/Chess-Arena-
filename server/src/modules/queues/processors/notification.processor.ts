import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private eventEmitter: EventEmitter2) {}

  @Process('send-notification')
  async handleSendNotification(job: Job) {
    const { userId, title, content, type, gameId } = job.data;
    
    this.logger.log(`Sending notification to user ${userId}: ${title}`);

    // TODO: Implement notification logic
    // - Save to database
    // - Send via WebSocket if user online
    // - Send push notification (optional)
    
    this.eventEmitter.emit('notification.sent', job.data);
    
    return { success: true };
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.debug(`Completed job ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}: ${err.message}`);
  }
}





