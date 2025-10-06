import { Controller, Post, Body, HttpCode, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SignInDto } from '@modules/auth/dto/sign-in.dto';
import { SkipAuth } from '@modules/auth/skip-auth.guard';
import { AccessRefreshTokens } from './types/auth.types';
import ApiBaseResponses from '@decorators/api-base-response.decorator';

@ApiTags('Auth')
@ApiBaseResponses()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: SignInDto })
  @SkipAuth()
  @HttpCode(200)
  @Post('signin')
  signIn(
    @Headers('user-agent') userAgent: string,
    @Body() signInDto: SignInDto,
  ): Promise<AccessRefreshTokens> {
    return this.authService.signIn(signInDto, userAgent);
  }

  @Post('check')
  checkAuth(): string {
    return 'OK';
  }
}
