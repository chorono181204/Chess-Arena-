import { Controller, Post, Body, HttpCode, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in.dto';
import { Public } from './decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: SignInDto })
  @Public()
  @HttpCode(200)
  @Post('signin')
  signIn(
    @Headers('user-agent') userAgent: string,
    @Body() signInDto: SignInDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.signIn(signInDto, userAgent);
  }

  @Post('check')
  checkAuth(): string {
    return 'OK';
  }
}
