import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { DUserSignInByEmail } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(dto: DUserSignInByEmail) {
    const user = await this.userService.getUserByEmail(dto.email);
    const decoded = bcrypt.compare(dto.password, user.password);
    if (!decoded)
      throw new BadRequestException('이메일 또는 비밀번호가 다릅니다.');

    return user;
  }

  async generateAccessToken(
    data: User,
    accountType: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      id: data.id,
      email: data.email,
      accountType: accountType,
    };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
        expiresIn: '5d',
      }),
    };
  }

  async generateRefreshToken(
    data: User,
    accountType: string,
  ): Promise<{ refresh_token: string }> {
    const payload = {
      id: data.id,
      email: data.email,
      accountType: accountType,
    };
    return {
      refresh_token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY'),
        expiresIn: '7d',
      }),
    };
  }

  async refreshAccessToken(
    _refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(_refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY'),
      });

      const accessToken = await this.generateAccessToken(
        { id: payload.sub, email: payload.email } as User,
        payload.accountType,
      );

      const refreshToken = await this.generateRefreshToken(
        { id: payload.sub, email: payload.email } as User,
        payload.accountType,
      );

      return {
        access_token: accessToken.access_token,
        refresh_token: refreshToken.refresh_token,
      };
    } catch (e) {
      throw new BadRequestException(e, '유효하지 않은 리프레시 토큰입니다.');
    }
  }

  async getSocialSignInCode(social: string) {
    if (social === 'naver')
      return `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${this.configService.get('N_CLIENT_ID')}&redirect_uri=${this.configService.get('N_REDIRECT_URI')}&state=${this.configService.get('N_STATE')}`;
    else if (social === 'google')
      return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${this.configService.get('G_CLIENT_ID')}&redirect_uri=${this.configService.get('G_REDIRECT_URI')}&scope=${encodeURIComponent('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email')}&access_type=offline`;
    else if (social === 'kakao')
      return `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${this.configService.get('K_REST_API_KEY')}&redirect_uri=${this.configService.get('K_REDIRECT_URI')}`;
  }

  async getSocialAccessToken(social: string, code: string) {
    let url: string;
    let params;
    let header: object;

    if (social === 'naver') {
      url = `https://nid.naver.com/oauth2.0/token`;
      params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.configService.get('N_CLIENT_ID'),
        client_secret: this.configService.get('N_CLIENT_SECRET'),
        redirect_uri: this.configService.get('N_REDIRECT_URI'),
        state: this.configService.get('N_STATE'),
        code,
      });
      header = {
        'X-Naver-Client-Id': this.configService.get('N_CLIENT_ID'),
        'X-Naver-Client-Secret': this.configService.get('N_CLIENT_SECRET'),
      };
    } else if (social === 'google') {
      url = 'https://oauth2.googleapis.com/token';
      params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.configService.get('G_CLIENT_ID'),
        client_secret: this.configService.get('G_CLIENT_SECRET'),
        redirect_uri: this.configService.get('G_REDIRECT_URI'),
        code,
      });
      header = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };
    } else if (social === 'kakao') {
      url = 'https://kauth.kakao.com/oauth/token';
      params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.configService.get('K_REST_API_KEY'),
        redirect_uri: this.configService.get('K_REDIRECT_URI'),
        code,
      });
      header = {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      };
    }

    const response = await axios.post(url, params, {
      headers: header,
    });

    return response.data.access_token;
  }

  async getSocialUserInfo(social: string, accessToken: string) {
    let url: string;
    if (social === 'naver') url = `https://openapi.naver.com/v1/nid/me`;
    else if (social === 'google')
      url = `https://www.googleapis.com/oauth2/v2/userinfo`;
    else if (social === 'kakao') url = `https://kapi.kakao.com/v2/user/me`;

    return await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}
