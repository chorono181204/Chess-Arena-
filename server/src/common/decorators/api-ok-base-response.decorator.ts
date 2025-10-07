import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { applyDecorators, HttpStatus, Type } from '@nestjs/common';

export const ApiOkBaseResponse = <TModel extends Type<any>>({
  dto,
  isArray,
  meta,
  message,
}: {
  dto?: TModel;
  isArray?: boolean;
  meta?: boolean;
  message?: string;
}) => {
  return applyDecorators(
    ApiExtraModels(dto || Function),
    ApiOkResponse({
      description: `${HttpStatus.OK}. Success`,
      schema: {
        type: 'object',
        properties: {
          status: { type: 'boolean' },
          message: { $ref: message, type: 'string' },
          data: isArray
            ? { items: { $ref: getSchemaPath(dto || '') }, type: 'array' }
            : { $ref: getSchemaPath(dto || '') },
          ...(meta && {
            meta: {
              properties: {
                total: { type: 'number' },
                lastPage: { type: 'number' },
                currentPage: { type: 'number' },
                perPage: { type: 'number' },
                prev: { type: 'number' },
                next: { type: 'number' },
              },
            },
          }),
        },
      },
    }),
  );
};

export const ApiCreatedBaseResponse = <TModel extends Type<any>>({
  dto,
  isArray,
  message,
}: {
  dto?: TModel;
  isArray?: boolean;
  message?: string;
}) => {
  return applyDecorators(
    ApiExtraModels(dto || Function),
    ApiCreatedResponse({
      description: `${HttpStatus.CREATED}. Created`,
      schema: {
        type: 'object',
        properties: {
          status: { type: 'boolean' },
          message: { $ref: message, type: 'string' },
          data: isArray
            ? { items: { $ref: getSchemaPath(dto || '') }, type: 'array' }
            : { $ref: getSchemaPath(dto || '') },
        },
      },
    }),
  );
};

export default ApiOkBaseResponse;
