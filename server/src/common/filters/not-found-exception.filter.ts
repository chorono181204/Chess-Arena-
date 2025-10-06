import { NOT_FOUND } from '@constants/error.constant';
import {
  Catch,
  ExceptionFilter,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: any) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    const status: number = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.NOT_FOUND;

    const exceptionResponse = {
      status: false,
      code: parseInt(NOT_FOUND.split(':')[0], 10),
      message: NOT_FOUND.split(':')[1].trim(),
      error: {
        message: exception.message,
        items: null,
      },
    };

    return res.status(status).json(exceptionResponse);
  }
}
