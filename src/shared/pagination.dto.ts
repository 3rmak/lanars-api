import { IsPositive, IsOptional } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  public page?: number;

  @IsOptional()
  @IsPositive()
  public per_page?: number;
}
