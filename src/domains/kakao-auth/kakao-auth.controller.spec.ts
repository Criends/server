import { Test, TestingModule } from '@nestjs/testing';
import { KakaoAuthController } from './kakao-auth.controller';
import { KakaoAuthService } from './kakao-auth.service';

describe('KakaoAuthController', () => {
  let controller: KakaoAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KakaoAuthController],
      providers: [KakaoAuthService],
    }).compile();

    controller = module.get<KakaoAuthController>(KakaoAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
