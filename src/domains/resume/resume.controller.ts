import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ResumeService } from './resume.service';
import {
  DActivity,
  DAdditionalResume,
  DCareer,
  DCertificate,
  DGetAllResumes,
  DIntroduce,
  DPersonnelInfo,
  DResumeInfo,
  DResumeOrder,
  DSite,
  SortResume,
} from './resume.dto';
import { Guard } from 'src/decorators/guard.decorator';
import { DAccount } from 'src/decorators/account.decorator';
import { User } from '../user/user.dto';
import { ExposeRange } from '@prisma/client';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get()
  async findAllResume(
    @Query('sort') sort: SortResume,
    @Query('expose') expose: ExposeRange,
  ) {
    return await this.resumeService.getAllResumes({ sort, expose });
  }

  //TODO: DAccount에 company type을 union으로 추가할 것!!
  @Guard('user', 'company')
  @Get(':id')
  async findResume(@Param('id') id: string) {
    return await this.resumeService.getResume(id);
  }

  @Guard('user')
  @Patch(':id')
  async editOrder(
    @Param('id') id: string,
    @Body() dto: DResumeOrder,
    @DAccount('user') user: User,
  ) {
    return await this.resumeService.editItemOrder(id, user.id, dto);
  }

  @Guard('user')
  @Patch('info/:branch')
  async editInfo(
    @Param('branch') branch: string,
    @Body() dto: DResumeInfo | DPersonnelInfo,
    @DAccount('user') user: User,
  ) {
    return await this.resumeService.editInfo(branch, dto, user.id);
  }

  @Guard('user')
  @Post(':branch')
  async addItems(
    @Param('branch') branch: string,
    @Body()
    dto:
      | DIntroduce[]
      | DActivity[]
      | DCertificate[]
      | DCareer[]
      | DSite[]
      | DAdditionalResume[],
    @DAccount('user') user: User,
  ) {
    return await this.resumeService.createItem(branch, dto, user.id);
  }

  @Guard('user')
  @Patch('item/:branch')
  async editItems(
    @Param('branch') branch: string,
    @Body()
    dto:
      | DIntroduce[]
      | DActivity[]
      | DCertificate[]
      | DCareer[]
      | DSite[]
      | DAdditionalResume[],
    @DAccount('user') user: User,
  ) {
    return await this.resumeService.editItem(branch, dto, user.id);
  }

  @Guard('user')
  @Delete(':id')
  async deleteItem(@Param('id') id: string, @DAccount('user') user: User) {
    await this.resumeService.deleteItem(id, user.id);
  }

  @Guard('user')
  @Delete()
  async resetResume(@DAccount('user') user: User) {
    await this.resumeService.resetResume(user.id);
  }

  @Guard('user')
  @Post(':id/like')
  async likeUnlikeResume(
    @Param('id') id: string,
    @DAccount('user') user: User,
  ) {
    return await this.resumeService.likeUnlikeResume(id, user.id);
  }
}
