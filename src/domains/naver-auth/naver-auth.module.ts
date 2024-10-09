import { Module } from '@nestjs/common';
import { NaverAuthService } from './naver-auth.service';
import { NaverAuthController } from './naver-auth.controller';
import { UserService } from '../user/user.service';

@Module({
  controllers: [NaverAuthController],
  providers: [NaverAuthService, UserService],
})
export class NaverAuthModule {}
