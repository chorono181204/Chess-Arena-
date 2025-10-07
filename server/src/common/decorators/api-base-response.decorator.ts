import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

const ApiBaseResponses = () => {
  const decorators = [
    ApiUnauthorizedResponse({
      schema: {
        type: 'object',
        example: {
          status: false,
          code: 401000,
          message: 'Unauthorized resource',
        },
      },
      description: `${HttpStatus.UNAUTHORIZED}. Unauthorized.`,
    }),
    ApiBadRequestResponse({
      schema: {
        type: 'object',
        example: {
          status: false,
          code: 400000,
          message: 'Bad request',
        },
      },
      description: `${HttpStatus.BAD_REQUEST}. Bad Request.`,
    }),
    ApiInternalServerErrorResponse({
      schema: {
        type: 'object',
        example: {
          status: false,
          code: 500000,
          message: 'Internal server error',
        },
      },
      description: `${HttpStatus.INTERNAL_SERVER_ERROR}. Internal Server Error.`,
    }),
    ApiNotFoundResponse({
      schema: {
        type: 'object',
        example: {
          status: false,
          code: 404000,
          message: 'Not found',
        },
      },
      description: `${HttpStatus.NOT_FOUND}. Not found.`,
    }),
  ];

  return applyDecorators(...decorators);
};

export default ApiBaseResponses;
