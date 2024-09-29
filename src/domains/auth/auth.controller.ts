import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DUserSignInByEmail } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() dto: DUserSignInByEmail) {
    return this.authService.signIn(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshAccessToken(@Body('refresh_token') refreshToken: string) {
    const tokens = await this.authService.refreshAccessToken(refreshToken);
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
    };
  }
}
