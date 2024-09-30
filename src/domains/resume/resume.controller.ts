import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ResumeService } from './resume.service';
import {
  DActivity,
  DAdditionalResume,
  DCareer,
  DCertificate,
  DGetAllResumes,
  DIntroduce,
  DResumeInfo,
} from './resume.dto';
import { Guard } from 'src/decorators/guard.decorator';
import { DAccount } from 'src/decorators/account.decorator';
import { User } from '../user/user.dto';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get()
  async findAllResume(@Body() data: DGetAllResumes) {
    return await this.resumeService.getAllResumes(data);
  }

  @Guard(['user', 'company'])
  @Get(':id')
  async findResume(@Param('id') id: string) {
    return await this.resumeService.getResume(id);
  }

  @Guard('user')
  @Patch('personnel-info')
  async editResumeInfo(@Body() dto: DResumeInfo, @DAccount('user') user: User) {
    return await this.resumeService.editResumeInfo(dto, user.id);
  }

  @Guard('user')
  @Patch('introduce')
  async editIntroduce(@Body() dto: DIntroduce[], @DAccount('user') user: User) {
    return await this.resumeService.editIntroduce(dto, user.id);
  }

  @Guard('user')
  @Patch('activity')
  async editActivity(@Body() dto: DActivity[], @DAccount('user') user: User) {
    return await this.resumeService.editActivity(dto, user.id);
  }

  @Guard('user')
  @Patch('certificate')
  async editCertificate(
    @Body() dto: DCertificate[],
    @DAccount('user') user: User,
  ) {
    return await this.resumeService.editCertificate(dto, user.id);
  }

  @Guard('user')
  @Patch('career')
  async editCareer(@Body() dto: DCareer[], @DAccount('user') user: User) {
    return await this.resumeService.editCareer(dto, user.id);
  }

  @Guard('user')
  @Patch('additional')
  async editAdditionalResume(
    @Body() dto: DAdditionalResume[],
    @DAccount('user') user: User,
  ) {
    return await this.resumeService.editAdditionalResume(dto, user.id);
  }

  @Guard('user')
  @Delete('item')
  async deleteItem(@Body('id') id: string) {
    await this.resumeService.deleteItem(id);
  }
}
