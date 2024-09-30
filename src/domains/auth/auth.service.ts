import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { DUserSignInByEmail } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(
    dto: DUserSignInByEmail,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.userService.getUserByEmail(dto.email);
    const decoded = bcrypt.compare(dto.password, user.password);
    if (!decoded)
      throw new BadRequestException('이메일 또는 비밀번호가 다릅니다.');

    const accessToken = await this.generateAccessToken(user, 'user');
    const refreshToken = await this.generateRefreshToken(user, 'user');

    return { ...accessToken, ...refreshToken };
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
}
