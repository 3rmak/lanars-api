import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

import { join, extname } from 'path';

@Injectable()
export class S3Service {
  private readonly bucketname: string;

  constructor(@Inject('S3_PROVIDER') private s3Client: S3Client, private configService: ConfigService) {
    this.bucketname = configService.get('S3_BUCKET_NAME');
  }

  public async uploadImage(image: Express.Multer.File, portfolioId: string, imageId: string): Promise<string> {
    const imageKey = S3Service.pathConstructor(image.originalname, portfolioId, imageId);
    const command = new PutObjectCommand({
      Bucket: this.bucketname,
      Key: imageKey,
      Body: image.buffer,
      CacheControl: 'max-age=63072000',
    });

    try {
      await this.s3Client.send(command);
      return this.getS3ImageUrl(imageKey);
    } catch (e) {
      throw new InternalServerErrorException(`error while uploading image to s3 bucket ${e.message}`);
    }
  }

  public async deleteImageByUrl(imageUrl: string): Promise<void> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketname,
        Key: this.getS3ImageKeyByUrl(imageUrl),
      });

      await this.s3Client.send(deleteCommand);
    } catch (e) {
      throw new InternalServerErrorException(`Unable to delete image. Error: ${e.message}`);
    }
  }

  private getS3ImageUrl(key: string): string {
    return `https://${this.bucketname}.s3.amazonaws.com/${key}`;
  }

  private getS3ImageKeyByUrl(url: string): string {
    return url.split(`https://${this.bucketname}.s3.amazonaws.com/`)[1];
  }

  private static pathConstructor(originalname: string, portfolioId: string, imageId: string): string {
    const extName = extname(originalname);
    return join('storage', portfolioId, imageId + extName);
  }
}
