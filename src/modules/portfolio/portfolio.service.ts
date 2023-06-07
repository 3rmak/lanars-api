import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';

import { PaginationUtility } from '../../shared/utils/pagination.utility';
import { ImageService } from '../image/image.service';

import { Portfolio } from './portfolio.model';
import { Image } from '../image/image.model';

import { PortfolioCreateDto } from './dto/create-portfolio.dto';
import { PortfolioUpdateDto } from './dto/update-portfolio.dto';
import { PaginationDto } from '../../shared/pagination.dto';

@Injectable()
export class PortfolioService {
  private paginationUtil: PaginationUtility;

  constructor(
    @InjectModel(Portfolio) private readonly portfolioRepository: typeof Portfolio,
    private imageService: ImageService,
    private configService: ConfigService,
  ) {
    const defaultPerPage = Number(configService.get('DEFAULT_PER_PAGE'));
    this.paginationUtil = new PaginationUtility(defaultPerPage);
  }

  public async createPortfolio(ownerId: string, dto: PortfolioCreateDto) {
    const portfolio = await this.portfolioRepository.findOne({ where: { alias: dto.alias, ownerId } });
    if (portfolio) {
      throw new BadRequestException(`Can't create portfolio. Portfolio with alias: ${dto.alias}, already exist`);
    }

    try {
      const body = { ownerId: ownerId, ...dto };
      return await this.portfolioRepository.create(body);
    } catch (e) {
      throw new InternalServerErrorException(`Portfolio wasn't created. Error: ${e.message}`);
    }
  }

  public async getPaginatedPortfolioList(ownerId: string, query: PaginationDto): Promise<Array<Portfolio>> {
    const { limit, offset } = this.paginationUtil.parse(query);
    try {
      return this.portfolioRepository.findAll({ where: { ownerId }, limit, offset });
    } catch (e) {
      throw new InternalServerErrorException(`Can't find portfolios. Error: ${e.message}`);
    }
  }

  public async patchPortfolio(ownerId: string, portfolioId: string, body: PortfolioUpdateDto) {
    const portfolio = await this.portfolioRepository.findOne({ where: { id: portfolioId, ownerId } });
    if (!portfolio) {
      throw new BadRequestException(`Portfolio wasn't found or you're not owner`);
    }

    try {
      const bodyKeys = Object.keys(body);
      portfolio.alias = bodyKeys.indexOf('alias') > -1 ? body.alias : portfolio.alias;
      portfolio.description = bodyKeys.indexOf('description') > -1 ? body.description : portfolio.description;

      return await portfolio.save();
    } catch (e) {
      throw new InternalServerErrorException(`Can't patch portfolio. Error: ${e.message}`);
    }
  }

  public async deletePortfolioById(ownerId: string, portfolioId: string): Promise<void> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId, ownerId },
      include: [{ model: Image }],
    });
    if (!portfolio) {
      throw new BadRequestException(`Portfolio wasn't found or you're not owner`);
    }

    try {
      for (const image of portfolio.images) {
        await this.imageService.deleteImageById(image.id, portfolio.ownerId);
      }
      await portfolio.destroy();
    } catch (e) {
      throw new InternalServerErrorException(`Can't delete portfolio or it content. Error: ${e.message}`);
    }
  }
}
