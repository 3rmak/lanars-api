import { ApiProperty } from '@nestjs/swagger';

import { Comment } from '../comment.model';

export class CommentResponseDto {
  constructor(comment: Comment) {
    this.id = comment.id;
    this.body = comment.body;
    this.userId = comment.userId;
  }

  @ApiProperty({ example: 'image-uuid-string' })
  public id: string;

  @ApiProperty({ example: 'comment body' })
  public body: string;

  @ApiProperty({ example: 'user-uuid-string' })
  public userId: string;
}
