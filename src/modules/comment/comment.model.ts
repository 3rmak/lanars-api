import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import sequelize from 'sequelize';

import { Exclude } from 'class-transformer';

import { User } from '../user/user.model';
import { Image } from '../image/image.model';
import { CommentResponseDto } from './dto/comment.response.dto';

interface CommentCreationAttrs {
  body: string;
  imageId: string;
  userId: string;
}

@Table({ tableName: 'comments' })
export class Comment extends Model<Comment, CommentCreationAttrs> {
  @ApiProperty({ example: '1' })
  @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: sequelize.UUIDV1 })
  public id: string;

  @ApiProperty({ example: 'comment body' })
  @Column({ type: DataType.STRING, allowNull: false })
  public body: string;

  @ApiProperty({ example: 'UUIDv1' })
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  public userId: string;

  @Exclude()
  @BelongsTo(() => User)
  public user: User;

  @ApiProperty({ example: 'UUIDv1' })
  @ForeignKey(() => Image)
  @Column({ type: DataType.UUID, allowNull: false })
  public imageId: string;

  @Exclude()
  @BelongsTo(() => Image)
  public image: Image;

  toDto(): CommentResponseDto {
    return new CommentResponseDto(this);
  }
}
