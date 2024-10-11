import {
  Body,
  Controller,
  Delete,
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
import { CookieOptions, Response } from 'express';
import { UserService } from '../user/user.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  private jwtSecret: string;
  private readonly cookieOptions: CookieOptions;
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {
    this.cookieOptions = {
      maxAge: 1000 * 60 * 15,
    };
    this.jwtSecret = this.configService.getOrThrow('JWT_SECRET_KEY');
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() dto: DUserSignInByEmail, @Res() res: Response) {
    const accessToken = await this.authService.signIn(dto);
    // const access_token = await this.jwtService.signAsync({}, this.jwtSecret, {
    //   subject: checkUser.id,
    // });

    console.log('accessToken: ', accessToken);
    res.cookie('accessToken', accessToken, this.cookieOptions);
    return res.send({ accessToken });
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

    let checkUser = await this.userService.getUserById(userId);
    if (!checkUser) checkUser = await this.userService.signUpBySocial(userId);

    const access_token = jwt.sign({}, this.jwtSecret, {
      subject: checkUser.id,
    });
    res.cookie('accessToken', access_token);
    res.send({ access_token });
  }

  @Delete()
  async signOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.status(204).send();
  }
}
