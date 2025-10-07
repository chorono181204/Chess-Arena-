import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ValidationException } from './validation.exception';
import { VALIDATION_ERROR } from '@constants/error.constant';

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost): any {
    const context = host.switchToHttp();
    const response = context.getResponse();

    const [code, message] = VALIDATION_ERROR.split(':');

    return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      status: false,
      code: parseInt(code, 10),
      message: message.trim(),
      error: {
        items: exception.validationErrors,
      },
    });
  }
}
