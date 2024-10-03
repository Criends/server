import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PortfolioService {
  constructor(private readonly prismaService: PrismaService) {}

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
