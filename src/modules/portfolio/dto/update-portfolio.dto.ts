import { IsOptional, IsString } from 'class-validator';

export class PortfolioUpdateDto {
  @IsString()
  @IsOptional()
  public alias?: string;

  @IsString()
  @IsOptional()
  public description?: string;
}
