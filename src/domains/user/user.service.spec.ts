import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserSignUpByEmail } from './user.dto';
import { PrismaModule } from '../../prisma/prisma.module';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let dto: UserSignUpByEmail;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let configMock: DeepMockProxy<ConfigService>;

  beforeEach(async () => {
    dto = new UserSignUpByEmail();
    prismaMock = mockDeep<PrismaClient>();
    configMock = mockDeep<ConfigService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: ConfigService,
          useValue: configMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  test('signUpByEmail: dto test', async () => {
    const validationErrors1 = await validate(dto);
    expect(validationErrors1).toHaveLength(2);

    dto.email = 'test@email.com';
    const validationErrors2 = await validate(dto);
    expect(validationErrors2).toHaveLength(1);

    dto.password = 'pW12345@';
    const validationErrors3 = await validate(dto);
    expect(validationErrors3).toHaveLength(0);
  });

  test('signUpByEmail: logic test', async () => {
    dto.email = 'test@email.com';
    dto.password = 'pW12345@';

    prismaMock.user.findFirst.mockResolvedValue(null);

    // 사용자 생성에 대한 Mock
    prismaMock.user.create.mockResolvedValue({
      id: 'some-id',
      email: dto.email,
      updatedAt: new Date(),
      password: 'hashed-password', // 해시된 패스워드 대신 placeholder
    });

    const user = await service.signUpByEmail(dto);
    expect(user).toBeDefined();

    prismaMock.user.findFirst.mockResolvedValueOnce({
      id: 'some-id',
      email: dto.email,
      updatedAt: new Date(),
      password: 'hashed-password',
    });

    await expect(service.signUpByEmail(dto)).rejects.toThrow(
      BadRequestException,
    );
  });
});
