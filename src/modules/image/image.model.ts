import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import sequelize from 'sequelize';

import { Exclude } from 'class-transformer';
import { Comment } from '../comment/comment.model';
import { Portfolio } from '../portfolio/portfolio.model';
import { ImageResponseDto } from './dto/image.response.dto';

interface ImageCreationAttrs {
  name: string;
  portfolioId: string;
  description?: string;
}

@Table({ tableName: 'images' })
export class Image extends Model<Image, ImageCreationAttrs> {
  @ApiProperty({ example: '1' })
  @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: sequelize.UUIDV1 })
  public id: string;

  @ApiProperty({ example: 'image name' })
  @Column({ type: DataType.STRING, allowNull: false })
  public name: string;

  @ApiProperty({ example: 'image description' })
  @Column({ type: DataType.STRING, allowNull: true, defaultValue: null })
  public description: string;

  @ApiProperty({ example: 'image url to bucket' })
  @Column({ type: DataType.STRING, allowNull: true, defaultValue: null })
  public url: string;

  @ApiProperty({ example: 'portfolio-uuid-string' })
  @ForeignKey(() => Portfolio)
  @Column({ type: DataType.UUID, allowNull: false })
  public portfolioId: string;

  @Exclude()
  @BelongsTo(() => Portfolio)
  public portfolio: Portfolio;

  @Exclude()
  @HasMany(() => Comment, { foreignKey: 'imageId', onDelete: 'CASCADE' })
  public comments: Comment[];

  toDto(): ImageResponseDto {
    return new ImageResponseDto(this);
  }
}
