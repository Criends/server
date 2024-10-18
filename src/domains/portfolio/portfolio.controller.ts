import { DAccount } from './../../decorators/account.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { Guard } from 'src/decorators/guard.decorator';
import { SortResume } from '../resume/resume.dto';
import {
  DAdditionalPortfolio,
  DContribution,
  DPortfolioOrder,
  DProjectInfo,
  DProjectOrder,
  DProjectSite,
  DSkill,
  DTeam,
  DTroubleShooting,
} from './portfolio.dto';
import { User } from '../user/user.dto';
import { ExposeRange } from '@prisma/client';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  async findAllPortfolio(
    @Query('sort') sort: SortResume,
    @Query('expose') expose: ExposeRange,
  ) {
    return await this.portfolioService.getAllPortfolio({ sort, expose });
  }

  @Guard('user', 'company')
  @Get(':id')
  async getPortfolio(@Param('id') id: string, @DAccount('user') user: User) {
    return await this.portfolioService.getPortfolio(id);
  }

  @Guard('user')
  @Post()
  async addProject(@DAccount('user') user: User) {
    return await this.portfolioService.createProject(user.id);
  }

  @Guard('user')
  @Patch(':projectId')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image1' },
      { name: 'image2' },
      { name: 'image3' },
      { name: 'image4' },
    ]),
  )
  async editProjectInfo(
    @UploadedFiles()
    repImages: {
      image1?: Express.Multer.File;
      image2?: Express.Multer.File;
      image3?: Express.Multer.File;
      image4?: Express.Multer.File;
    },
    @Param('projectId')
    projectId: string,
    @Body() dto: DProjectInfo,
    @DAccount('user') user: User,
  ) {
    await this.portfolioService.editRepImages(projectId, repImages, user.id);
    await this.portfolioService.editProjectInfo(projectId, dto, user.id);
  }

  @Guard('user')
  @Patch()
  @Guard('user')
  @Patch()
  async editProjectOrder(
    @Body() dto: DPortfolioOrder[],
    @DAccount('user') user: User,
  ) {
    await this.portfolioService.editProjectOrder(dto, user.id);
  }

  //프로젝트에 팀/스킬/사이트/정보/기여/트러블슈팅/추가사항 추가
  @Guard('user')
  @Post(':projectId/:branch')
  async addItem(
    @Param('projectId') projectId: string,
    @Param('branch') branch: string,
    @Body()
    dto:
      | DAdditionalPortfolio[]
      | DContribution[]
      | DProjectSite[]
      | DSkill[]
      | DTeam[]
      | DTroubleShooting[],
    @DAccount('user') user: User,
  ) {
    return await this.portfolioService.createItem(
      projectId,
      branch,
      dto,
      user.id,
    );
  }

  @Guard('user')
  @Patch(':projectId/edit-order')
  async editItemOrder(
    @Param('projectId') projectId: string,
    @Body() dto: DProjectOrder,
    @DAccount('user') user: User,
  ) {
    await this.portfolioService.editItemOrder(projectId, dto, user.id);
  }

  @Guard('user')
  @Patch('item/:branch')
  async editItem(
    @Param('branch') branch: string,
    @Body()
    dto:
      | DAdditionalPortfolio[]
      | DContribution[]
      | DProjectSite[]
      | DSkill[]
      | DTeam[]
      | DTroubleShooting[],
    @DAccount('user') user: User,
  ) {
    return await this.portfolioService.editItem(branch, dto, user.id);
  }

  @Guard('user')
  @Delete(':projectId')
  async deleteProject(
    @Param('projectId') projectId: string,
    @DAccount('user') user: User,
  ) {
    return this.portfolioService.deleteProject(projectId, user.id);
  }

  @Guard('user')
  @Delete('item/:id')
  async deleteItem(@Param('id') id: string, @DAccount('user') user: User) {
    return this.portfolioService.deleteItem(id, user.id);
  }

  @Guard('user')
  @Delete('reset')
  async resetPortfolio(@DAccount('user') user: User) {
    await this.portfolioService.resetPortfolio(user.id);
  }
}
