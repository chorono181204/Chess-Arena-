import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';
import { AuthService } from '@modules/auth/auth.service';
import { Reflector } from '@nestjs/core';
import { IS_SKIP_AUTH_KEY } from '@modules/auth/skip-auth.guard';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
    private reflector: Reflector,
  ) {}

  /**
   * @desc Check if user is authenticated
   * @param context ExecutionContext
   * @returns Promise<boolean>
   *       true if user is authenticated
   *       false otherwise
   *       @throws UnauthorizedException
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tokenData = this.extractTokenFromHeader(request);
    const isSkipAuth = this.reflector.getAllAndOverride<boolean>(
      IS_SKIP_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isSkipAuth) {
      return true;
    }
    if (!tokenData) {
      throw new UnauthorizedException();
    }

    try {
      if (tokenData.type == 'Basic') {
        await this.authService.getAccessTokenClientAuth(tokenData.token);
      }

      if (tokenData.type == 'Bearer') {
        await this.tokenService.getAccessTokenFromWhitelist(tokenData.token);

        // 💡 We're assigning the payload to the request object here
        // so that we can access it in our route handlers
        request['user'] = await this.jwtService.verifyAsync(tokenData.token, {
          secret: this.configService.get<string>('jwt.accessToken'),
        });
        request['user']._meta = {
          accessToken: tokenData.token,
        };
      }
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  /**
   * @desc Extract token from header
   * @param request Request
   * @returns string | undefined
   * @private
   */
  private extractTokenFromHeader(
    request: Request,
  ): { type: string; token: string } | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type === 'Bearer' || type === 'Basic') {
      return {
        type,
        token,
      };
    } else {
      return undefined;
    }
  }
}
