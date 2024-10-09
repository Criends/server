import { Module } from '@nestjs/common';
import { KakaoAuthService } from './kakao-auth.service';
import { KakaoAuthController } from './kakao-auth.controller';
import { UserService } from '../user/user.service';

@Module({
  controllers: [KakaoAuthController],
  providers: [KakaoAuthService, UserService],
})
export class KakaoAuthModule {}
