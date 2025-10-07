import * as basicAuth from 'express-basic-auth';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import {
  INestApplication,
  Logger,
  RequestMethod,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from 'src/app.module';
import { VersioningOptions } from '@nestjs/common/interfaces/version-options.interface';
import { AllExceptionsFilter } from '@common/filters/all-exception.filter';
import { PrismaClientExceptionFilter } from '@providers/prisma/prisma-client-exception.filter';
import { ValidationExceptionFilter } from '@common/filters/validation-exception.filter';
import { BadRequestExceptionFilter } from '@common/filters/bad-request-exception.filter';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { AccessExceptionFilter } from '@common/filters/access-exception.filter';
import { NotFoundExceptionFilter } from '@common/filters/not-found-exception.filter';
import { AppConfig, SwaggerConfig } from '@config/types/config.type';
import validationExceptionFactory from '@common/filters/validation-exception-factory';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';

async function bootstrap(): Promise<{ port: number }> {
  /**
   * Create NestJS application
   */
  const app: INestApplication = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: true,
  });

  const configService: ConfigService<any, boolean> = app.get(ConfigService);
  const appConfig: AppConfig = configService.get('app');
  const swaggerConfig: SwaggerConfig = configService.get('swagger');
  // const logger = app.get(LoggerService);
  {
    /**
     * loggerLevel: 'error' | 'warn' | 'log' | 'verbose' | 'debug' | 'silly';
     * https://docs.nestjs.com/techniques/logger#log-levels
     */
    const options = appConfig.loggerLevel;
    app.useLogger(options);
  }

  {
    /**
     * ValidationPipe options
     * https://docs.nestjs.com/pipes#validation-pipe
     */
    const options = {
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
    };

    app.useGlobalPipes(
      new ValidationPipe({
        ...options,
        exceptionFactory: validationExceptionFactory,
      }),
    );
  }

  {
    /**
     * set global prefix for all routes except GET /
     */
    const options = {
      exclude: [{ path: '/', method: RequestMethod.GET }],
    };

    app.setGlobalPrefix('api', options);
  }

  {
    /**
     * Enable versioning for all routes
     * https://docs.nestjs.com/openapi/multiple-openapi-documents#versioning
     */
    const options: VersioningOptions = {
      type: VersioningType.URI,
      defaultVersion: '1',
    };

    app.enableVersioning(options);
  }

  {
    /**
     * Setup Swagger API documentation
     * https://docs.nestjs.com/openapi/introduction
     */
    app.use(
      ['/docs'],
      basicAuth.default({
        challenge: true,
        users: {
          admin: swaggerConfig.password,
        },
      }),
    );

    const options: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
      .setTitle('Api v1')
      .setDescription('Attendance Service API v1')
      .setVersion('1.0')
      .addBearerAuth({ in: 'header', type: 'http' })
      .build();
    const document: OpenAPIObject = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        // If set to true, it persists authorization data,
        // and it would not be lost on browser close/refresh
        persistAuthorization: true,
      },
    });
  }

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));

  {
    /**
     * Enable global filters
     * https://docs.nestjs.com/exception-filters
     */
    const { httpAdapter } = app.get(HttpAdapterHost);

    app.useGlobalFilters(
      new AllExceptionsFilter(),
      new AccessExceptionFilter(httpAdapter),
      new NotFoundExceptionFilter(),
      new BadRequestExceptionFilter(),
      new PrismaClientExceptionFilter(httpAdapter),
      new ValidationExceptionFilter(),
    );
  }

  await app.listen(appConfig.port);

  return appConfig;
}

bootstrap().then((appConfig) => {
  Logger.log(
    `Running in http://localhost:${appConfig.port}`,
    'Attendance Service',
  );
});
