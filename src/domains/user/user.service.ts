import { Injectable } from '@nestjs/common';
import { UserSignUpByEmail } from './user.dto';
import { nanoid } from 'nanoid';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async signUpByEmail(data: UserSignUpByEmail) {
    const checkEmail = await this.getUserInfo(data.email);
    if (checkEmail) return false;

    const id: string = nanoid(8);
    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(data.password, salt);
    const newUser = await this.prismaService.user.create({
      data: { id, email: data.email, password: hash },
    });

    return newUser;
  }

  async getUserInfo(email: string) {
    return await this.prismaService.user.findFirst({ where: { email: email } });
  }
}
