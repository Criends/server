import { Controller, Get, Param } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { Guard } from 'src/decorators/guard.decorator';
import { DGetAllResumes } from '../resume/resume.dto';

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
}
