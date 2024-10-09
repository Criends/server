import { Test, TestingModule } from '@nestjs/testing';
import { NaverAuthService } from './naver-auth.service';

describe('NaverAuthService', () => {
  let service: NaverAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NaverAuthService],
    }).compile();

    service = module.get<NaverAuthService>(NaverAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
