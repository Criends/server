import { Controller, Get, Param } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { Guard } from 'src/decorators/guard.decorator';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Guard(['user', 'company'])
  @Get(':id')
  async getPortfolio(@Param('id') id: string) {
    return await this.portfolioService.getPortfolio(id);
  }
}
