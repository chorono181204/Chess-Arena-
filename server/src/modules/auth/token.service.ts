import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TokenRepository } from '@modules/auth/token.repository';
import { AccessRefreshTokens, UserPayload } from './types/auth.types';
import { JwtConfig } from '@config/types/config.type';

@Injectable()
export class TokenService {
  jwtConfig: JwtConfig;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenRepository: TokenRepository,
  ) {
    this.jwtConfig = this.configService.get('jwt');
  }

  async sign(payload: UserPayload): Promise<AccessRefreshTokens> {
    const [_refreshToken, _accessToken] = await Promise.all([
      await this.tokenRepository.getRefreshTokenFromWhitelist(payload.id),
      await this.tokenRepository.getAccessTokenFromWhitelist(payload.id),
    ]);
    if (_accessToken && _refreshToken) {
      return {
        refreshToken: _refreshToken,
        accessToken: _accessToken,
      };
    }
  }

  async login(payload: UserPayload): Promise<AccessRefreshTokens> {
    const userId = payload.id;

    const [_refreshToken, _accessToken] = await Promise.all([
      await this.tokenRepository.getRefreshTokenFromWhitelist(userId),
      await this.tokenRepository.getAccessTokenFromWhitelist(userId),
    ]);
    if (_accessToken && _refreshToken) {
      return {
        refreshToken: _refreshToken,
        accessToken: _accessToken,
      };
    }
  }

  async getAccessTokenFromWhitelist(accessToken: string): Promise<void> {
    const payload: UserPayload = await this.jwtService.verifyAsync(
      accessToken,
      {
        secret: this.configService.get<string>('jwt.accessToken'),
      },
    );
    const userId = payload.id;

    const token =
      await this.tokenRepository.getAccessTokenFromWhitelist(userId);

    if (!token) {
      // check if token is in the whitelist
      throw new UnauthorizedException();
    }
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<AccessRefreshTokens | void> {
    const payload: UserPayload = await this.jwtService.verifyAsync(
      refreshToken,
      {
        secret: this.jwtConfig.refreshToken,
      },
    );

    const userId = payload.id;
    if (!userId) throw new UnauthorizedException('User id is missing');

    const token =
      await this.tokenRepository.getRefreshTokenFromWhitelist(userId);

    if (refreshToken !== token) {
      // check if refresh token from the request is equal to the token from the redis whitelist
      throw new UnauthorizedException();
    }

    if (!token) {
      // check if token is in the whitelist
      throw new UnauthorizedException();
    }

    const _payload: UserPayload = {
      id: payload.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
    };

    const _accessToken = this.createJwtAccessToken(_payload);
    const _refreshToken = this.createJwtRefreshToken(_payload);

    await Promise.all([
      this.tokenRepository.saveRefreshTokenToWhitelist({
        userId: userId,
        refreshToken: _refreshToken,
        expireInSeconds: this.jwtConfig.jwtExpRefreshToken,
      }),
      this.tokenRepository.saveAccessTokenToWhitelist({
        userId: userId,
        accessToken: _accessToken,
        expireInSeconds: this.jwtConfig.jwtExpAccessToken,
      }),
    ]);

    return {
      accessToken: _accessToken,
      refreshToken: _refreshToken,
    };
  }

  async logout(accessToken: string): Promise<void> {
    const payload: UserPayload = await this.jwtService.verifyAsync(
      accessToken,
      {
        secret: this.jwtConfig.accessToken,
      },
    );
    const userId = payload.id;

    await Promise.all([
      this.tokenRepository.deleteAccessTokenFromWhitelist(userId),
      this.tokenRepository.deleteRefreshTokenFromWhitelist(userId),
    ]);
  }

  async isPasswordCorrect(
    dtoPassword: string,
    password: string,
  ): Promise<boolean> {
    const adjustHash = (hash: string) => hash.replace(/^\$2y\$/, '$2b$');
    const hashedPassword = adjustHash(password);
    return bcrypt.compare(dtoPassword, hashedPassword);
  }

  createJwtAccessToken(payload: UserPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.jwtConfig.jwtExpAccessToken,
      secret: this.jwtConfig.accessToken,
    });
  }

  createJwtRefreshToken(payload: UserPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.jwtConfig.jwtExpRefreshToken,
      secret: this.jwtConfig.refreshToken,
    });
  }

  createJwtAccessTokenPhone(payload: UserPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.jwtConfig.jwtExpAccessToken,
      secret: this.jwtConfig.accessToken,
    });
  }

  createJwtRefreshTokenPhone(payload: UserPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.jwtConfig.jwtExpRefreshToken,
      secret: this.jwtConfig.refreshToken,
    });
  }
}
