import { ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators';
import { InjectModel } from '@nestjs/sequelize';

import { Sequelize } from 'sequelize-typescript';

import { S3Service } from '../../s3/s3.service';
import { PaginationSequelizeResponseDto } from '../../shared/utils/pagination.utility';

import { Image } from './image.model';
import { Portfolio } from '../portfolio/portfolio.model';

import { ImageCreateDto } from './dto/create-image.dto';
import { FilteredResponseDto } from '../../shared/dto/filtered-response.dto';

@Injectable()
export class ImageService {
  constructor(
    @InjectModel(Image) private imageRepository: typeof Image,
    @InjectModel(Portfolio) private readonly portfolioRepository: typeof Portfolio,
    private s3Service: S3Service,
    private sequelize: Sequelize,
  ) {}

  public async createImage(userId: string, uploadImage: Express.Multer.File, body: ImageCreateDto): Promise<Image> {
    const { portfolioId } = body;
    const portfolio = await this.portfolioRepository.findByPk(portfolioId);
    if (!portfolio) throw new NotFoundException('portfolio with such id was not found');

    try {
      return await this.sequelize.transaction(async (t) => {
        const image = await this.imageRepository.create(body, { transaction: t });
        const imageUrl = await this.s3Service.uploadImage(uploadImage, portfolioId, image.id);

        image.url = imageUrl;
        await image.save({ transaction: t });

        return image;
      });
    } catch (e) {
      throw new InternalServerErrorException(`Image was not created. Error: ${e.message}`);
    }
  }

  public async getImageById(imageId: string): Promise<Image> {
    const image = await this.imageRepository.findByPk(imageId, { include: { all: true } });
    if (!image) {
      throw new NotFoundException('image not found');
    }

    return image;
  }

  public async getImagesByPortfolioId(
    portfolioId: string,
    query: PaginationSequelizeResponseDto,
  ): Promise<FilteredResponseDto<Image>> {
    const { limit, offset } = query;

    try {
      const { rows, count } = await this.imageRepository.findAndCountAll({
        where: { portfolioId },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });
      return {
        total: count,
        data: rows,
      };
    } catch (e) {
      throw new InternalServerErrorException(`Can't extract images from db. Error: ${e.message}`);
    }
  }

  public async getImagesFeed(query: PaginationSequelizeResponseDto): Promise<FilteredResponseDto<Image>> {
    const { limit, offset } = query;

    try {
      const { rows, count } = await this.imageRepository.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
      return {
        data: rows,
        total: count,
      };
    } catch (e) {
      throw new InternalServerErrorException(`Can't extract images from db. Error: ${e.message}`);
    }
  }

  public async deleteImageById(imageId: string, userId: string): Promise<void> {
    const image = await this.getImageById(imageId);
    if (image.portfolio.ownerId != userId) {
      throw new ForbiddenException('User is not image owner');
    }

    try {
      await this.sequelize.transaction(async (t) => {
        const imageUrl = image.url;
        await image.destroy({ transaction: t });
        await this.s3Service.deleteImageByUrl(imageUrl);
      });
    } catch (e) {
      throw new InternalServerErrorException(`Image wasn't deleted. Error: ${e.message}`);
    }
  }
}
