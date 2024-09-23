import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/guards/guard';

@Module({
  controllers: [CompanyController],
  providers: [
    CompanyService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class CompanyModule {}
