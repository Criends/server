import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/guards/auth.guard';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [UserModule, ConfigModule, PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
