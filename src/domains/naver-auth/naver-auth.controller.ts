import { Controller, Get, Query, Res } from '@nestjs/common';
import { NaverAuthService } from './naver-auth.service';
import { Response } from 'express';
import axios from 'axios';
import { UserService } from '../user/user.service';

@Controller('naver-auth')
export class NaverAuthController {
  constructor(
    private readonly naverAuthService: NaverAuthService,
    private readonly userService: UserService,
  ) {}

  @Get()
  async getNaverCode(@Res() res: Response) {
    const url = await this.naverAuthService.getCode();

    res.redirect(url);
  }

  @Get('callback')
  async naverCallback(@Query('code') code: string, @Res() res: Response) {
    const accessToken = await this.naverAuthService.getNaverAccessToken(code);

    const url = `https://openapi.naver.com/v1/nid/me`;

    const userInfo = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    await this.userService.createUser(userInfo.data.response.id);

    return res.send({ accessToken });
  }
}
