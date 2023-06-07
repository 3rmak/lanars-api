import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { ImageService } from '../image/image.service';

import { Comment } from './comment.model';

import { CommentCreateDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment) private commentRepository: typeof Comment,
    private readonly imageService: ImageService,
  ) {}

  public async getCommentById(commentId: string): Promise<Comment> {
    const comment = await this.commentRepository.findByPk(commentId);
    if (!comment) {
      throw new NotFoundException('comment not found');
    }

    return comment;
  }

  public async createComment(userId: string, body: CommentCreateDto): Promise<Comment> {
    await this.imageService.getImageById(body.imageId);

    try {
      const comment = await this.commentRepository.create(body);
      return comment;
    } catch (e) {
      throw new BadRequestException(`Comment was not created. Error: ${e.message}`);
    }
  }

  public async deleteComment(userId: string, commentId: string): Promise<void> {
    const comment = await this.getCommentById(commentId);
    if (comment.userId != userId) {
      throw new ForbiddenException(`User is not comment owner`);
    }
    await comment.destroy();
  }
}
