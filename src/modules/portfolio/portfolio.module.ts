import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ImageModule } from '../image/image.module';

import { PortfolioController } from './portfolio.controller';

import { PortfolioService } from './portfolio.service';

import { Portfolio } from './portfolio.model';
@Module({
  controllers: [PortfolioController],
  imports: [SequelizeModule.forFeature([Portfolio]), ImageModule],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
