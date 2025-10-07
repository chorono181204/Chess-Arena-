import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { base64decode } from '@common/utilities/base64encryption';
import { SignInDto } from './dto/sign-in.dto';
import { AccessRefreshTokens } from './types/auth.types';
import UserEntity from '@modules/user/entities/user.entity';
import { UserRepository } from '@modules/user/user.repository';
import {
  INVALID_CREDENTIALS,
  USER_MULTI_LOGIN,
  USER_NOT_ACTIVE,
  USER_NOT_FOUND,
  USER_NOT_VERIFIED,
} from '@constants/error.constant';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * @desc Sign in a user
   * @returns AccessRefreshTokens - Access and refresh tokens
   * @throws NotFoundException - User not found
   * @throws UnauthorizedException - Invalid credentials
   * @param signInDto - User credentials
   */
  async signIn(
    signInDto: SignInDto,
    userAgent: string,
  ): Promise<AccessRefreshTokens> {
    const testUser: UserEntity = await this.userRepository.findOne({
      where: {
        email: signInDto.email,
      },
    });

    if (!testUser) throw new NotFoundException(USER_NOT_FOUND);

    if (
      !(await this.tokenService.isPasswordCorrect(
        signInDto.password,
        testUser.password,
      ))
    ) {
      // 401001: Invalid credentials
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    return this.tokenService.sign({
      id: testUser.id,
      name: testUser.name,
      email: testUser.email,
    });
  }

  async getAccessTokenClientAuth(token: string): Promise<boolean> {
    const clientSecret = base64decode(token);
    const username = clientSecret.split(':')[0];
    const password = clientSecret.split(':')[1];

    if (
      username === process.env.BASIC_AUTH_USERNAME &&
      password === process.env.BASIC_AUTH_PASSWORD
    ) {
      return true;
    }

    return false;
  }
}
