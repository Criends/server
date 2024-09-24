import { Injectable } from '@nestjs/common';
import { UserSignUpByEmail } from './user.dto';
import { nanoid } from 'nanoid';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async signUpByEmail(data: UserSignUpByEmail) {
    const checkEmail = await this.prismaService.user.findFirst({
      where: { email: data.email },
    });
    if (checkEmail) {
      return false;
    }

    const id: string = nanoid(8);
    const newUser = await this.prismaService.user.create({
      data: { id, email: data.email, password: data.password },
    });

    return newUser;
  }
}
