import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { Guard } from 'src/decorators/guard.decorator';
import { DGetAllResumes } from '../resume/resume.dto';
import { DAccount } from 'src/decorators/account.decorator';
import { User } from '@prisma/client';
import {
  DAdditionalPortfolio,
  DContribution,
  DProjectInfo,
  DProjectSite,
  DSkill,
  DTeam,
  DTroubleShooting,
} from './portfolio.dto';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  async findAllPortfolio(@Body() data: DGetAllResumes) {
    return await this.portfolioService.getAllPortfolio(data);
  }

  @Guard(['user', 'company'])
  @Get(':id')
  async getPortfolio(@Param('id') id: string) {
    return await this.portfolioService.getPortfolio(id);
  }

  //포트폴리오에 프로젝트 추가
  @Guard('user')
  @Post()
  async addProject(@DAccount('user') user: User) {
    return await this.portfolioService.createProject(user.id);
  }

  @Guard('user')
  @Patch(':projectId')
  async editProjectInfo(
    @Param('id') id: string,
    @Body() dto: DProjectInfo,
    @DAccount('user') user: User,
  ) {
    return await this.portfolioService.editProjectInfo(id, dto, user.id);
  }

  //프로젝트에 팀/스킬/사이트/정보/기여/트러블슈팅/추가사항 추가
  @Guard('user')
  @Post(':projectId')
  async addItem(
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
    return await this.portfolioService.createItem(branch, dto, user.id);
  }

  @Guard('user')
  @Patch('item/:branch')
  async editProject(
    @Param('branch') branch: string,
    @Body()
    dto:
      | DAdditionalPortfolio[]
      | DContribution[]
      | DProjectSite[]
      | DSkill[]
      | DTeam[]
      | DTroubleShooting[],
  ) {
    return await this.portfolioService.editItem(branch, dto);
  }

  @Guard('user')
  @Delete('item/:id')
  async deleteItem(@Param('id') id: string, @DAccount('user') user: User) {
    return this.portfolioService.deleteItem(id, user.id);
  }

  @Guard('user')
  @Delete(':id')
  async resetPortfolio(@Param('id') id: string, @DAccount('user') user: User) {
    await this.portfolioService.resetPortfolio(id, user.id);
  }
}
