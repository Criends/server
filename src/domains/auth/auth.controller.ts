import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { DUserSignInByEmail } from './auth.dto';
import { Response } from 'express';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

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

  @Get(':social')
  async getSocialSignInCode(
    @Param('social') social: string,
    @Res() res: Response,
  ) {
    const url = await this.authService.getSocialSignInCode(social);
    res.redirect(url);
  }

  @Get(':social/callback')
  async socialCallback(
    @Param('social') social: string,
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    const accessToken = await this.authService.getSocialAccessToken(
      social,
      code,
    );

    const userInfo = await this.authService.getSocialUserInfo(
      social,
      accessToken,
    );

    let userId: string;
    if (social === 'naver') userId = userInfo.data.response.id;
    else if (social === 'google') userId = userInfo.data.id.toString();
    else if (social === 'kakao') userId = userInfo.data.id.toString();

    const checkUser = await this.userService.getUserById(userId);
    if (checkUser) res.send({ accessToken });
    else this.userService.createUser(userId);
  }
}
