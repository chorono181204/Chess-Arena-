import { Catch, HttpStatus, BadRequestException } from '@nestjs/common';
import { BAD_REQUEST } from '@constants/error.constant';
import BaseExceptionFilter from './base-exception.filter';
import { LoggerService } from '@providers/logger/logger.service';

@Catch(BadRequestException)
export class BadRequestExceptionFilter extends BaseExceptionFilter {
  constructor() {
    super(BAD_REQUEST, HttpStatus.BAD_REQUEST);
  }
}
