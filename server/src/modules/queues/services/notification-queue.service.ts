import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface NotificationJobData {
  userId: string;
  title: string;
  content: string;
  type: string;
  gameId?: string;
}

@Injectable()
export class NotificationQueue {
  constructor(
    @InjectQueue('notification')
    private notificationQueue: Queue<NotificationJobData>,
  ) {}

  async addSendNotificationJob(data: NotificationJobData) {
    return await this.notificationQueue.add('send-notification', data, {
      priority: 1,
    });
  }

  async addBulkNotificationJob(data: NotificationJobData[]) {
    return await this.notificationQueue.addBulk(
      data.map((item) => ({
        name: 'send-notification',
        data: item,
        opts: { priority: 2 },
      })),
    );
  }
}





