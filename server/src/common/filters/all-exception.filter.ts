import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { INTERNAL_SERVER_ERROR } from '@constants/error.constant';
import { LoggerService } from '@providers/logger/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    const status: number = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessage = exception?.response?.message || INTERNAL_SERVER_ERROR;

    const [code, message] = errorMessage.split(':');

    if (!message) {
      const [serverErrorCode] = INTERNAL_SERVER_ERROR.split(':');

      const exceptionResponse = {
        status: false,
        code: parseInt(serverErrorCode, 10),
        message: errorMessage?.trim() || INTERNAL_SERVER_ERROR,
        error: {
          details: {
            message: exception?.response?.error,
            items: null,
          },
        },
      };

      Logger.error(exception, 'AllExceptionsFilter');
      Logger.error(exception.stack, 'AllExceptionsFilter');

      return res.status(status).json(exceptionResponse);
    }

    const exceptionResponse = {
      status: false,
      code: parseInt(code, 10),
      message: message?.trim(),
      error: exception?.response?.error,
    };

    Logger.error(exception, 'AllExceptionsFilter');
    Logger.error(exception.stack, 'AllExceptionsFilter');

    return res.status(status).json(exceptionResponse);
  }
}
