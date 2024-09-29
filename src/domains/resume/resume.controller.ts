import { Body, Controller, Get, Param } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { DGetAllResumes } from './resume.dto';
import { Guard } from 'src/decorators/guard.decorator';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get()
  async findAllResume(@Body() data: DGetAllResumes) {
    return await this.resumeService.getAllResumes(data);
  }

  @Guard(['user', 'company'])
  @Get()
  async findResume(@Param() id: string) {
    return await this.resumeService.getResume(id);
  }
}
