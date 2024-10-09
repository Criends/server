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

    await this.prismaService.resume.create({
      data: {
        user: { connect: { id: id } },
        updatedAt: new Date(),
      },
    });

    await this.prismaService.portfolio.create({
      data: {
        user: { connect: { id: id } },
      },
    });

    await this.prismaService.personnelInfo.create({
      data: {
        resume: { connect: { id: id } },
        name: '',
        email: '',
        phone: '',
        address: '',
      },
    });

    return newUser;
  }

  async getUserByEmail(email: string) {
    const checkEmail = await this.prismaService.user.findFirst({
      where: { email: email },
    });

    if (!checkEmail) throw new NotFoundException('존재하지 않는 사용자입니다.');
    return checkEmail;
  }

  async getUserById(id: string) {
    return await this.prismaService.user.findFirst({
      where: { id: id },
    });
  }

  async createUser(socialId: string) {
    return this.prismaService.user.create({
      data: {
        id: socialId,
      },
    });
  }
}
