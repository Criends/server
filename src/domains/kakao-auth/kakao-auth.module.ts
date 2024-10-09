import { Module } from '@nestjs/common';
import { KakaoAuthService } from './kakao-auth.service';
import { KakaoAuthController } from './kakao-auth.controller';

@Module({
  controllers: [KakaoAuthController],
  providers: [KakaoAuthService],
})
export class KakaoAuthModule {}
