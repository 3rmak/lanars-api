import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ImageModule } from '../image/image.module';

import { CommentController } from './comment.controller';

import { CommentService } from './comment.service';

import { Comment } from './comment.model';

@Module({
  controllers: [CommentController],
  providers: [CommentService],
  imports: [ImageModule, SequelizeModule.forFeature([Comment])],
})
export class CommentModule {}
