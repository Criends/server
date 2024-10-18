import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ResumeService } from './resume.service';
import {
  DActivity,
  DAdditionalResume,
  DCareer,
  DCertificate,
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
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { S3Service } from '../s3/s3.service';

@Controller('resume')
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly s3Service: S3Service,
  ) {}

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
  @Patch('info/resume-info')
  async editResumeInfo(@Body() dto: DResumeInfo, @DAccount('user') user: User) {
    return await this.resumeService.editInfo('resume-info', dto, user.id);
  }

  @Guard('user')
  @UseInterceptors(FileInterceptor('profileImage'))
  @Patch('info/personnel-info')
  async editInfo(
    @Body() dto: DPersonnelInfo,
    @DAccount('user') user: User,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    const imagePath = await this.s3Service.uploadFile(profileImage);

    dto.profileImage = await imagePath[0];
    return await this.resumeService.editInfo('personnel-info', dto, user.id);
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
