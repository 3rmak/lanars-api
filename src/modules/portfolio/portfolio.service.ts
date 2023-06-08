import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { PaginationSequelizeResponseDto } from '../../shared/utils/pagination.utility';
import { ImageService } from '../image/image.service';

import { Portfolio } from './portfolio.model';
import { Image } from '../image/image.model';

import { PortfolioCreateDto } from './dto/create-portfolio.dto';
import { PortfolioUpdateDto } from './dto/update-portfolio.dto';
import { FilteredResponseDto } from '../../shared/dto/filtered-response.dto';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectModel(Portfolio) private readonly portfolioRepository: typeof Portfolio,
    private imageService: ImageService,
  ) {}

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

  public async getPaginatedPortfolioList(
    ownerId: string,
    query: PaginationSequelizeResponseDto,
  ): Promise<FilteredResponseDto<Portfolio>> {
    const { limit, offset } = query;

    try {
      const { count, rows } = await this.portfolioRepository.findAndCountAll({ where: { ownerId }, limit, offset });
      return {
        data: rows,
        total: count,
      };
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
