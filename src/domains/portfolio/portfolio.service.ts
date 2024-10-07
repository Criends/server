import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DGetAllResumes, SortResume } from '../resume/resume.dto';
import { nanoid } from 'nanoid';
import {
  DAdditionalPortfolio,
  DContribution,
  DProjectInfo,
  DProjectSite,
  DSkill,
  DTeam,
  DTroubleShooting,
} from './portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllPortfolio(data: DGetAllResumes) {
    const orderByField: object[] = [];

    switch (data.sort) {
      case SortResume.UPDATED_AT:
        orderByField.push({ updatedAt: 'desc' });
        break;
      case SortResume.LIKES:
        orderByField.push({ likes: 'desc' }, { updatedAt: 'desc' });
        break;
      case SortResume.PROPOSAL:
        orderByField.push({ proposal: 'desc' }, { updatedAt: 'desc' });
        break;
    }

    return await this.prismaService.portfolio.findMany({
      where: { expose: data.expose },
      orderBy: orderByField,
    });
  }

  async getPortfolio(portfolioId: string) {
    return await this.prismaService.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        project: {
          select: {
            id: true,
            index: true,
            contribution: true,
            troubleShooting: true,
            additionalPortfolio: true,
          },
          orderBy: {
            index: 'asc',
          },
        },
      },
    });
  }

  async createProject(userId: string) {
    return await this.prismaService.project.create({
      data: {
        id: nanoid(4) + '_' + userId,
        index: 0,
        title: '',
        content: '',
        startDate: '',
        portfolio: { connect: { id: userId } },
      },
    });
  }

  async editProjectInfo(id: string, dto: DProjectInfo, userId: string) {
    try {
      return await this.prismaService.project.update({
        where: { id: id },
        data: { ...dto },
      });
    } catch {
      if (id.split('', 12)[0] !== userId)
        throw new UnauthorizedException('권한이 없습니다.');
      throw new NotFoundException('존재하지 않는 항목입니다.');
    }
  }

  async createItem(
    branch: string,
    dto:
      | DAdditionalPortfolio[]
      | DContribution[]
      | DProjectSite[]
      | DSkill[]
      | DTeam[]
      | DTroubleShooting[],
    userId: string,
  ) {
    const target = this.classifyBranch(branch);

    return await Promise.all(
      dto.map(async (value) => {
        return await this.prismaService[target].create({
          data: {
            id: target + nanoid(4) + userId,
            project: { connect: { id: userId } },
            ...value,
          },
        });
      }),
    );
  }

  async editItem(
    branch: string,
    dto:
      | DAdditionalPortfolio[]
      | DContribution[]
      | DProjectSite[]
      | DSkill[]
      | DTeam[]
      | DTroubleShooting[],
  ) {
    const target = this.classifyBranch(branch);

    return await Promise.all(
      dto.map(async (value) => {
        return await this.prismaService[target].update({
          where: { id: branch },
          data: {
            ...value,
          },
        });
      }),
    );
  }

  async deleteItem(id: string, userId: string) {
    const target = this.classifyBranch(id.split('', 12)[0]);
    console.log(target);

    try {
      return await this.prismaService[target].delete({
        where: { id: id, projectId: userId },
      });
    } catch {
      if (id.split('', 12)[0] !== userId)
        throw new UnauthorizedException('권한이 없습니다.');
      throw new NotFoundException('존재하지 않는 항목입니다.');
    }
  }

  classifyBranch(target: string): string {
    if (target.startsWith('team')) return 'team';
    else if (target.startsWith('skill')) return 'skill';
    else if (target.startsWith('project-site')) return 'projectSite';
    else if (target.startsWith('contribution')) return 'contribution';
    else if (target.startsWith('trouble-shooting')) return 'troubleShooting';
    else if (target.startsWith('additional-portfolio'))
      return 'additionalPortfolio';
    else throw new BadRequestException('존재하지 않는 항목입니다.');
  }

  async resetPortfolio(id: string, userId: string) {
    return await this.prismaService.project.deleteMany({
      where: { id: id, portfolioId: userId },
    });
  }
}
