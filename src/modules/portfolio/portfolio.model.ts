import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import sequelize from 'sequelize';
import { Exclude } from 'class-transformer';

import { Image } from '../image/image.model';
import { User } from '../user/user.model';
import { PortfolioResponseDto } from './dto/portfolio.response.dto';

interface PortfolioCreationAttrs {
  alias: string;
  ownerId: string;
  description?: string;
}

@Table({ tableName: 'portfolios' })
export class Portfolio extends Model<Portfolio, PortfolioCreationAttrs> {
  @ApiProperty({ example: '1' })
  @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: sequelize.UUIDV1 })
  public id: string;

  @ApiProperty({ example: 'Cold pictures(not nudes)' })
  @Column({ type: DataType.STRING, unique: false, allowNull: false })
  public alias: string;

  @ApiProperty({ example: 'Cold pictures' })
  @Column({ type: DataType.STRING, allowNull: false })
  public description: string;

  @HasMany(() => Image, { foreignKey: 'portfolioId', onDelete: 'CASCADE' })
  public images: Image[];

  @ApiProperty({ example: 'UUIDv1' })
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  public ownerId: string;

  @Exclude()
  @BelongsTo(() => User)
  public user: User;

  toDto(): PortfolioResponseDto {
    return new PortfolioResponseDto(this);
  }
}
