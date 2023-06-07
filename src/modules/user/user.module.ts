import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { PortfolioModule } from '../portfolio/portfolio.module';

import { UserController } from './user.controller';

import { UserService } from './user.service';

import { User } from './user.model';

@Module({
  controllers: [UserController],
  imports: [SequelizeModule.forFeature([User]), PortfolioModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
