import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
  DResume,
  DResumeInfo,
  DSite,
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

  //TODO: DAccount에 company type을 union으로 추가할 것!!
  @Guard(['user', 'company'])
  @Get(':id')
  async findResume(@Param('id') id: string, @DAccount('user') user: User) {
    return await this.resumeService.getResume(id);
  }

  @Guard('user')
  @Patch(':branch')
  async editInfo(
    @Param('branch') branch: string,
    @Body() dto: DResumeInfo | DPersonnelInfo,
    @DAccount('user') user: User,
  ) {
    return await this.resumeService.editInfo(branch, dto, user.id);
  }

  // @Guard('user')
  // @Patch('personnel-info')
  // async editResumeInfo(
  //   @Body() dto: DPersonnelInfo,
  //   @DAccount('user') user: User,
  // ) {
  //   return await this.resumeService.editPersonnelInfo(dto, user.id);
  // }

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
  @Patch(':branch')
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

  // @Guard('user')
  // @Patch('introduce')
  // async editIntroduce(@Body() dto: DIntroduce[], @DAccount('user') user: User) {
  //   return await this.resumeService.editIntroduce(dto, user.id);
  // }

  // @Guard('user')
  // @Patch('activity')
  // async editActivity(@Body() dto: DActivity[], @DAccount('user') user: User) {
  //   return await this.resumeService.editActivity(dto, user.id);
  // }

  // @Guard('user')
  // @Patch('certificate')
  // async editCertificate(
  //   @Body() dto: DCertificate[],
  //   @DAccount('user') user: User,
  // ) {
  //   return await this.resumeService.editCertificate(dto, user.id);
  // }

  // @Guard('user')
  // @Patch('career')
  // async editCareer(@Body() dto: DCareer[], @DAccount('user') user: User) {
  //   return await this.resumeService.editCareer(dto, user.id);
  // }

  // @Guard('user')
  // @Patch('site')
  // async editSite(@Body() dto: DSite[], @DAccount('user') user: User) {
  //   return await this.resumeService.editSite(dto, user.id);
  // }

  // @Guard('user')
  // @Patch('additional')
  // async editAdditionalResume(
  //   @Body() dto: DAdditionalResume[],
  //   @DAccount('user') user: User,
  // ) {
  //   return await this.resumeService.editAdditionalResume(dto, user.id);
  // }

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
