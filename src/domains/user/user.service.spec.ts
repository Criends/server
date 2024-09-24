import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

import { validate } from 'class-validator';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { DUserSignUpByEmail } from './user.dto';

describe('UserService', () => {
  let service: UserService;
  let dto: DUserSignUpByEmail;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let configMock: DeepMockProxy<ConfigService>;

  beforeEach(async () => {
    dto = new DUserSignUpByEmail();
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

  test('signUpByEmail: 사용자 생성', async () => {
    dto.email = 'jest1@email.com';
    dto.password = 'pW12345@';

    prismaMock.user.findFirst.mockResolvedValue(null);

    prismaMock.user.create.mockResolvedValue({
      id: 'some-id',
      email: dto.email,
      updatedAt: new Date(),
      password: 'hashed-password',
    });

    const user = await service.signUpByEmail(dto);
    expect(user).toBeDefined();
    expect(user.email).toBe(dto.email);
  });
});
