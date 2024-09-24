import { BadRequestException, Injectable } from '@nestjs/common';
import { User, UserSignUpByEmail } from './user.dto';
import { nanoid } from 'nanoid';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async signUpByEmail(data: UserSignUpByEmail): Promise<User | null> {
    const checkEmail = await this.getUserInfo(data.email);
    if (checkEmail)
      throw new BadRequestException('이미 존재하는 이메일입니다.');

    const id: string = nanoid(8);
    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(data.password, salt);
    const newUser = await this.prismaService.user.create({
      data: { id, email: data.email, password: hash },
    });

    return newUser;
  }

  async getUserInfo(email: string): Promise<User | null> {
    return await this.prismaService.user.findFirst({ where: { email: email } });
  }
}
