import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NaverAuthService {
  constructor(private readonly configService: ConfigService) {}

  private readonly clientId: string = this.configService.get('N_CLIENT_ID');
  private readonly clientSecret: string =
    this.configService.get('N_CLIENT_SECRET');
  private readonly redirectUri: string =
    this.configService.get('N_REDIRECT_URI');
  private readonly state: string = this.configService.get('N_STATE');

  private readonly originalURL = 'https://developers.naver.com/notice';
  private readonly apiURL =
    'https://openapi.naver.com/v1/util/shorturl?url=' + this.originalURL;

  async getCode() {
    return `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${this.redirectUri}&state=${this.state}`;
  }

  async getNaverAccessToken(code: string) {
    const url = `https://nid.naver.com/oauth2.0/token`;
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_id: this.redirectUri,
      code,
      state: this.state,
    });
    const header = {
      'X-Naver-Client-Id': this.clientId,
      'X-Naver-Client-Secret': this.clientSecret,
    };

    const response = await axios.post(url, params, { headers: header });

    return response.data.access_token;
  }
}
