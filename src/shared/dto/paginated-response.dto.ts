import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'The page you are on', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of data items per page', example: 10 })
  perPage: number;

  @ApiProperty({ description: 'Total number of items found', example: 35 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 5 })
  totalPages: number;

  data: T[];
}
