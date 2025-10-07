import {
  Catch,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { INTERNAL_SERVER_ERROR } from '@constants/error.constant';
import BaseExceptionFilter from './base-exception.filter';

@Catch(InternalServerErrorException)
export class InternalServerErrorExceptionFilter extends BaseExceptionFilter {
  constructor() {
    super(INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
