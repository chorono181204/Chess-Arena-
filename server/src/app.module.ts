import appConfig from '@config/app.config';
import jwtConfig from '@config/jwt.config';
import redisConfig from '@config/redis.config';
import swaggerConfig from '@config/swagger.config';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { AuthGuard } from '@modules/auth/auth.guard';
import { AuthModule } from '@modules/auth/auth.module';
import { TokenRepository } from '@modules/auth/token.repository';
import { TokenService } from '@modules/auth/token.service';
import { CaslModule } from '@modules/casl';
import HealthModule from '@modules/health/health.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaModule } from '@providers/prisma';
import { RedisModule } from '@providers/redis';
import { WebSocketModule } from '@modules/websocket/websocket.module';
import { EventsModule } from '@modules/events/events.module';
import { QueueModule } from '@modules/queues/queue.module';
import { GameModule } from '@modules/game/game.module';

@Module({
  controllers: [],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, redisConfig, swaggerConfig],
    }),
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    JwtModule.register({
      global: true,
    }),
    // Event-Driven Architecture
    EventsModule,
    // WebSocket for real-time
    WebSocketModule,
    // Queue for background jobs
    QueueModule,
    // Game module
    GameModule,
    // CaslModule.forRoot<Roles>({
    //   // Role to grant full access, optional
    //   superuserRole: Roles.superadmin,
    // }),
    HealthModule,
    AuthModule,
  ],
  providers: [
    TokenService,
    JwtService,
    TokenRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
