import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CommentCreateDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'nice pic' })
  public body: string;

  @IsUUID()
  @ApiProperty({ example: 'image-uuid-string' })
  public imageId: string;

  @IsUUID()
  @ApiProperty({ example: 'user-uuid-string' })
  public userId: string;
}
