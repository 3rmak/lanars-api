import { Portfolio } from '../portfolio.model';
import { ApiProperty } from '@nestjs/swagger';

import { ImageResponseDto } from '../../image/dto/image.response.dto';

export class PortfolioResponseDto {
  constructor(portfolio: Portfolio) {
    this.id = portfolio.id;
    this.alias = portfolio.alias;
    this.description = portfolio.description;
    this.ownerId = portfolio.ownerId;
    this.images = portfolio.images?.length ? portfolio.images.map((image) => image.toDto()) : [];
  }

  @ApiProperty({ example: 'portfolio-uuid-string' })
  id: string;

  @ApiProperty({ example: 'working portfolio' })
  alias: string;

  @ApiProperty({ example: 'short descr' })
  description: string;

  @ApiProperty({ description: 'array of images obj' })
  images: Array<ImageResponseDto>;

  @ApiProperty({ example: 'user-uuid-string' })
  ownerId: string;
}
