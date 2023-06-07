import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PortfolioCreateDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Summer 2020' })
  public alias: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'before war chill' })
  public description?: string;
}
