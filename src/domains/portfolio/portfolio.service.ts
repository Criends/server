import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DGetAllResumes, SortResume } from '../resume/resume.dto';

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
            projectInfo: true,
            contribution: true,
            troubleShooting: true,
            additionalPortfolio: true,
          },
        },
      },
    });
  }
}
