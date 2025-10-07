import { Controller, Get } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { SkipAuth } from '@modules/auth/skip-auth.guard';

@Controller('logger')
export class LoggerController {
  constructor(private readonly logger: LoggerService) {}

  @Get('info')
  @SkipAuth()
  getInfoLog() {
    this.logger.log('This is an INFO log message from the LoggerController.', 'LoggerController');
    return 'Logged an INFO message.';
  }

  @Get('error')
  @SkipAuth()
  getErrorLog() {
    this.logger.error('This is an ERROR log message from the LoggerController.', null, 'LoggerController');
    return 'Logged an ERROR message.';
  }
}