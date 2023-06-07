import { ApiProperty } from '@nestjs/swagger';

import { Image } from '../image.model';

export class ImageResponseDto {
  constructor(image: Image) {
    this.id = image.id;
    this.name = image.name;
    this.description = image.description;
    this.url = image.url;
  }

  @ApiProperty({ example: 'image-uuid-string' })
  public id: string;

  @ApiProperty({ example: 'image name' })
  public name: string;

  @ApiProperty({ example: 'image description' })
  public description: string;

  @ApiProperty({ example: 'https://S3_BUCKET_NAME.s3.AWS_REGION.amazonaws.com/image.jpg' })
  public url: string;
}
