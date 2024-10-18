import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { S3Service } from '../s3/s3.service';

@Module({
  controllers: [PortfolioController],
  providers: [PortfolioService, S3Service],
})
export class PortfolioModule {}
