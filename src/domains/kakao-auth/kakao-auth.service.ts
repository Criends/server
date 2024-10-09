import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class KakaoAuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private readonly restApiKey: string =
    this.configService.get('K_REST_API_KEY');
  private readonly redirectUri: string =
    this.configService.get('K_REDIRECT_URI');

  getCode() {
    return `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${this.restApiKey}&redirect_uri=${this.redirectUri}`;
  }

  async getKakaoAccessToken(code: string) {
    const url = 'https://kauth.kakao.com/oauth/token';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.restApiKey,
      redirect_id: this.redirectUri,
      code,
    });
    const header = {
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };

    const response = await axios.post(url, params, {
      headers: header,
    });

    return response.data.access_token;
  }
}
