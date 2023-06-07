import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImageCreateDto {
  @IsUUID()
  @ApiProperty({ example: 'portfolio-uuid-string' })
  public portfolioId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'pic name' })
  public name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'pic descr' })
  public description?: string;
}
