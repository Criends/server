import { Test, TestingModule } from '@nestjs/testing';
import { NaverAuthController } from './naver-auth.controller';
import { NaverAuthService } from './naver-auth.service';

describe('NaverAuthController', () => {
  let controller: NaverAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NaverAuthController],
      providers: [NaverAuthService],
    }).compile();

    controller = module.get<NaverAuthController>(NaverAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
