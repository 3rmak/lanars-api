import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import sequelize from 'sequelize';
import { Exclude } from 'class-transformer';

import { Comment } from '../comment/comment.model';
import { Portfolio } from '../portfolio/portfolio.model';

import { UserResponseDto } from './dto/user.response.dto';

interface UserCreationAttrs {
  email: string;
  password: string;
  fullName?: string;
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttrs> {
  @ApiProperty({ example: '1' })
  @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: sequelize.UUIDV1 })
  public id: string;

  @ApiProperty({ example: 'user@domain.com' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  public email: string;

  @ApiProperty({ example: 'asdkasdmsekmf', description: 'hashed password' })
  @Column({ type: DataType.STRING, allowNull: false })
  public password: string;

  @ApiProperty({ example: 'Winston Smith', description: 'user full name' })
  @Column({ type: DataType.STRING, allowNull: true, defaultValue: null })
  public fullName: string;

  @Exclude()
  @HasMany(() => Portfolio, { foreignKey: 'ownerId', onDelete: 'CASCADE' })
  public portfolios: Portfolio[];

  @Exclude()
  @HasMany(() => Comment, { foreignKey: 'userId', onDelete: 'CASCADE' })
  public comments: Comment[];

  toDto(): UserResponseDto {
    return new UserResponseDto(this);
  }
}
