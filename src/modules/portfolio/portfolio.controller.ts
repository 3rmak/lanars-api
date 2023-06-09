import { ConfigService } from '@nestjs/config';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PortfolioCreateDto } from './dto/create-portfolio.dto';
import { PortfolioUpdateDto } from './dto/update-portfolio.dto';
import { PortfolioService } from './portfolio.service';
import { PortfolioResponseDto } from './dto/portfolio.response.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestUser } from '../../shared/decorators/user.decorator';
import { PayloadUser } from '../../shared/payload-user.interface';
import { PaginationDto } from '../../shared/pagination.dto';
import { PaginationUtility } from '../../shared/utils/pagination.utility';
import { PaginatedResponseDto } from '../../shared/dto/paginated-response.dto';

@ApiTags('Portfolio')
@Controller('portfolios')
export class PortfolioController {
  private paginationUtil: PaginationUtility;

  constructor(private readonly portfolioService: PortfolioService, private configService: ConfigService) {
    const defaultPerPage = Number(configService.get('DEFAULT_PER_PAGE'));
    this.paginationUtil = new PaginationUtility(defaultPerPage);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Portfolio creation endpoint' })
  @ApiResponse({ status: 201, type: PortfolioResponseDto })
  public async createPortfolio(
    @RequestUser() user: PayloadUser,
    @Body() body: PortfolioCreateDto,
  ): Promise<PortfolioResponseDto> {
    const portfolio = await this.portfolioService.createPortfolio(user.id, body);
    return portfolio.toDto();
  }

  @Get('/:userId')
  @ApiOperation({ summary: 'Get all portfolio endpoint' })
  @ApiResponse({ status: 200, type: Array<PortfolioResponseDto> })
  public async getAll(
    @Param() param: any,
    @Query() query: PaginationDto,
  ): Promise<PaginatedResponseDto<PortfolioResponseDto>> {
    const sequelizeQuery = this.paginationUtil.parse(query);
    const { data, total } = await this.portfolioService.getPaginatedPortfolioList(param.userId, sequelizeQuery);

    return {
      page: sequelizeQuery.page,
      perPage: sequelizeQuery.limit,
      totalPages: Math.ceil(total / sequelizeQuery.limit),
      total,
      data: data.map((f) => f.toDto()),
    };
  }

  @Patch('/:portfolioId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update portfolio endpoint' })
  @ApiResponse({ status: 200, type: PortfolioResponseDto })
  public async update(@RequestUser() user: PayloadUser, @Param() params: any, @Body() body: PortfolioUpdateDto) {
    return this.portfolioService.patchPortfolio(user.id, params.portfolioId, body);
  }

  @Delete('/:portfolioId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete portfolio endpoint' })
  @ApiResponse({ status: 200 })
  public async delete(@RequestUser() user: PayloadUser, @Param() params: any): Promise<void> {
    return this.portfolioService.deletePortfolioById(user.id, params.portfolioId);
  }
}
