import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { S3Module } from '../../s3/s3.module';

import { ImageController } from './image.controller';

import { ImageService } from './image.service';

import { Image } from './image.model';
import { Portfolio } from '../portfolio/portfolio.model';

@Module({
  controllers: [ImageController],
  providers: [ImageService],
  imports: [SequelizeModule.forFeature([Image, Portfolio]), S3Module],
  exports: [ImageService],
})
export class ImageModule {}
