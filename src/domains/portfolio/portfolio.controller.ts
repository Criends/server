import { DAccount } from './../../decorators/account.decorator';
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
import {
  DAdditionalPortfolio,
  DContribution,
  DPortfolioOrder,
  DProjectInfo,
  DProjectSite,
  DSkill,
  DTeam,
  DTroubleShooting,
} from './portfolio.dto';
import { User } from '../user/user.dto';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  async findAllPortfolio(@Body() data: DGetAllResumes) {
    return await this.portfolioService.getAllPortfolio(data);
  }

  @Guard('user', 'company')
  @Get(':id')
  async getPortfolio(@Param('id') id: string, @DAccount('user') user: User) {
    return await this.portfolioService.getPortfolio(id);
  }

  //포트폴리오에 프로젝트 추가

  @Guard('user')
  @Post()
  async addProject(@DAccount('user') user: User) {
    console.log(user);
    return await this.portfolioService.createProject(user.id);
  }

  @Guard('user')
  @Patch(':projectId')
  async editProjectInfo(
    @Param('projectId') projectId: string,
    @Body() dto: DProjectInfo,
    @DAccount('user') user: User,
  ) {
    return await this.portfolioService.editProjectInfo(projectId, dto, user.id);
  }

  @Guard('user')
  @Patch('edit-order')
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
