import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DUserSignUpByEmail, User } from './user.dto';
import { nanoid } from 'nanoid';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async signUpByEmail(data: DUserSignUpByEmail): Promise<User> {
    const checkEmail = await this.prismaService.user.findFirst({
      where: { email: data.email },
    });

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

  async getUser(id: string): Promise<User> {
    const user = await this.prismaService.user.findFirst({
      where: { id: id },
    });

    if (!user) throw new NotFoundException('존재하지 않는 사용자입니다.');
    return user;
  }
}
