import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { DUserSignInByEmail } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(dto: DUserSignInByEmail): Promise<{ access_token: string }> {
    const user = await this.userService.getUserByEmail(dto.email);
    const decoded = bcrypt.compare(dto.password, user.password);
    if (!decoded)
      throw new BadRequestException('이메일 또는 비밀번호가 다릅니다.');

    return this.generateAccessToken(user, 'user');
  }

  async generateAccessToken(
    data: User,
    accountType: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: data.id,
      email: data.email,
      accountType: accountType,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
