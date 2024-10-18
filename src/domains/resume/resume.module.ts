import { Module } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { S3Service } from '../s3/s3.service';

@Module({
  controllers: [ResumeController],
  providers: [ResumeService, S3Service],
})
export class ResumeModule {}
