import { Injectable, Logger } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name)

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async emit(event: string, data: any): Promise<void> {
    try {
      this.eventEmitter.emit(event, data)
      this.logger.log(`Event emitted: ${event}`)
    } catch (error) {
      this.logger.error(`Failed to emit event ${event}:`, error)
    }
  }

  async emitAsync(event: string, data: any): Promise<void> {
    try {
      await this.eventEmitter.emitAsync(event, data)
      this.logger.log(`Async event emitted: ${event}`)
    } catch (error) {
      this.logger.error(`Failed to emit async event ${event}:`, error)
    }
  }
}