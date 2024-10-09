import { Controller, Get, Query, Res } from '@nestjs/common';
import { KakaoAuthService } from './kakao-auth.service';
import { Response } from 'express';
import axios from 'axios';

@Controller('kakao-auth')
export class KakaoAuthController {
  constructor(private readonly kakaoAuthService: KakaoAuthService) {}

  @Get()
  getKakakoCode(@Res() res: Response) {
    const url = this.kakaoAuthService.getCode();

    res.redirect(url);
  }

  @Get('callback')
  async kakaoCallback(@Query('code') code: string, @Res() res: Response) {
    const accessToken = await this.kakaoAuthService.getKakaoAccessToken(code);

    const url = 'https://kapi.kakao.com/v2/user/me';

    const userInfo = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const newUser = await this.kakaoAuthService.createUser(
      userInfo.data.id.toString(),
    );

    return res.send({ accessToken });
  }
}
