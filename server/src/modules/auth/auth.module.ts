import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { AuthController } from './auth.controller';
import { UserRepository } from '@modules/user/user.repository';
import { TokenRepository } from './token.repository';
import { RedisModule } from '@providers/redis';

@Module({
  imports: [RedisModule],
  controllers: [AuthController],
  providers: [AuthService, TokenService, UserRepository, TokenRepository],
  exports: [AuthService],
})
export class AuthModule {}
