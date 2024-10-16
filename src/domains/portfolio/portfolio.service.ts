import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DGetAllResumes, SortResume } from '../resume/resume.dto';
import { nanoid } from 'nanoid';
import {
  DAdditionalPortfolio,
  DContribution,
  DPortfolioOrder,
  DProject,
  DProjectInfo,
  DProjectOrder,
  DProjectSite,
  DSkill,
  DTeam,
  DTroubleShooting,
} from './portfolio.dto';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class PortfolioService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

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
    const projectList = await this.prismaService.project.findMany({
      where: { portfolioId: portfolioId },
      select: { id: true },
      orderBy: {
        index: 'asc',
      },
    });

    const projectDetails = await Promise.all(
      projectList.map(async (project: DProject) => {
        const order = await this.prismaService.project.findUnique({
          where: { id: project.id },
          select: {
            teamIndex: true,
            skillIndex: true,
            projectSiteIndex: true,
            contributionIndex: true,
            troubleShootingIndex: true,
            additionalPortfolioIndex: true,
          },
        });

        const sections = [
          { key: 'team', index: order.teamIndex },
          { key: 'skill', index: order.skillIndex },
          { key: 'projectSite', index: order.projectSiteIndex },
          { key: 'contribution', index: order.contributionIndex },
          { key: 'troubleShooting', index: order.troubleShootingIndex },
          { key: 'additionalPortfolio', index: order.additionalPortfolioIndex },
        ];

        sections.sort((a, b) => a.index - b.index);

        const selectObject: any = {
          id: true,
          index: true,
          title: true,
          content: true,
          startDate: true,
          endDate: true,
          repImages: true,
        };

        sections.forEach((section) => {
          selectObject[section.key] = { orderBy: { index: 'asc' } };
        });

        return await this.prismaService.project.findFirst({
          where: { id: project.id },
          select: selectObject,
        });
      }),
    );

    return projectDetails;
  }

  async createProject(userId: string) {
    await this.updateUpdatedAt(userId);

    const index = await this.prismaService.project.count({
      where: { portfolioId: userId },
    });

    return await this.prismaService.project.create({
      data: {
        id: nanoid(4) + '_' + userId,
        index: index,
        title: '',
        content: '',
        startDate: '',
        portfolio: { connect: { id: userId } },
      },
    });
  }

  async editProjectInfo(id: string, dto: DProjectInfo, userId: string) {
    if (!id.endsWith(userId))
      throw new ForbiddenException('수정 권한이 없습니다.');

    await this.updateUpdatedAt(userId);
    return await this.prismaService.project.update({
      where: { id: id },
      data: { ...dto },
    });
  }

  async editRepImages(id: string, repImages, userId: string) {
    if (!id.endsWith(userId))
      throw new ForbiddenException('수정 권한이 없습니다.');

    const imageKeys = ['image1', 'image2', 'image3', 'image4'];
    const list = {};

    await Promise.all(
      imageKeys.map(async (key) => {
        const image = repImages?.[key]?.[0];
        if (image) {
          const path = await this.s3Service.uploadFile(image);
          list[key] = path;
        }
      }),
    );
    return await this.prismaService.repImages.upsert({
      where: { id },
      create: {
        id: id,
        project: {
          connect: { id: id },
        },
        ...list,
      },
      update: list,
    });
  }

  async editProjectOrder(dto: DPortfolioOrder[], userId: string) {
    await this.updateUpdatedAt(userId);
    await Promise.all(
      dto.map(async (value: DPortfolioOrder) => {
        if (!value.projectId.endsWith(userId))
          throw new ForbiddenException('권한이 없습니다.');
        await this.prismaService.project.update({
          where: { id: value.projectId },
          data: { index: value.index },
        });
      }),
    );
  }

  async createItem(
    projectId: string,
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
    if (!projectId.endsWith(userId))
      throw new ForbiddenException('권한이 없습니다.');
    const target = this.classifyBranch(branch);

    await this.updateUpdatedAt(userId);

    return await Promise.all(
      dto.map(async (value) => {
        return await this.prismaService[target].create({
          data: {
            id: target + nanoid(4) + userId,
            project: { connect: { id: projectId } },
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
    userId: string,
  ) {
    const target = this.classifyBranch(branch);

    await this.updateUpdatedAt(userId);

    return await Promise.all(
      dto.map(async (value) => {
        return await this.prismaService[target].update({
          where: { id: value.id },
          data: {
            ...value,
          },
        });
      }),
    );
  }

  async editItemOrder(id: string, dto: DProjectOrder, userId: string) {
    if (!id.endsWith(userId)) throw new ForbiddenException('권한이 없습니다.');

    await this.updateUpdatedAt(userId);

    await this.prismaService.project.update({
      where: { id: id },
      data: { ...dto },
    });
  }

  async deleteProject(id: string, userId: string) {
    if (!id.endsWith(userId))
      throw new ForbiddenException('삭제 권한이 없습니다.');
    try {
      await this.updateUpdatedAt(userId);
      await this.prismaService.project.delete({ where: { id: id } });
    } catch {
      throw new NotFoundException('존재하지 않는 항목입니다.');
    }
  }

  async deleteItem(id: string, userId: string) {
    if (!id.endsWith(userId))
      throw new ForbiddenException('삭제 권한이 없습니다.');

    const target = this.classifyBranch(id);

    await this.updateUpdatedAt(userId);
    await this.prismaService[target].delete({
      where: { id: id },
    });
  }

  classifyBranch(target: string): string {
    if (target.startsWith('team')) return 'team';
    else if (target.startsWith('skill')) return 'skill';
    else if (target.startsWith('site')) return 'projectSite';
    else if (target.startsWith('project-site')) return 'projectSite';
    else if (target.startsWith('contribution')) return 'contribution';
    else if (target.startsWith('trouble')) return 'troubleShooting';
    else if (target.startsWith('troubleShooting')) return 'troubleShooting';
    else if (target.startsWith('additional')) return 'additionalPortfolio';
    else if (target.startsWith('additionalPortfolio'))
      return 'additionalPortfolio';
    else throw new BadRequestException('존재하지 않는 항목입니다.');
  }

  async resetPortfolio(userId: string) {
    await this.updateUpdatedAt(userId);
    return await this.prismaService.project.deleteMany({
      where: { portfolioId: userId },
    });
  }

  async updateUpdatedAt(id: string) {
    await this.prismaService.portfolio.update({
      where: { id: id },
      data: { updatedAt: new Date() },
    });
  }
}
