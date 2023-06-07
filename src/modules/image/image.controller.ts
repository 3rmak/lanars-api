import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ImageService } from './image.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { ImageCreateDto } from './dto/create-image.dto';
import { PaginationDto } from '../../shared/pagination.dto';
import { ImageResponseDto } from './dto/image.response.dto';
import { RequestUser } from '../../shared/decorators/user.decorator';
import { PayloadUser } from '../../shared/payload-user.interface';

@ApiTags('Images')
@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ description: 'creating new portfolio' })
  @ApiResponse({ status: 201, type: ImageResponseDto })
  public async create(
    @RequestUser() user: PayloadUser,
    @UploadedFile() uploadImage: Express.Multer.File,
    @Body() body: ImageCreateDto,
  ): Promise<ImageResponseDto> {
    const image = await this.imageService.createImage(user.id, uploadImage, body);
    return image.toDto();
  }

  @Get('/feed')
  @ApiOperation({ summary: 'get images by portfolio id' })
  @ApiResponse({ status: 200, type: Array<ImageResponseDto> })
  public async getImagesFeed(@Query() query: PaginationDto): Promise<Array<ImageResponseDto>> {
    const images = await this.imageService.getImagesFeed(query);
    return images.map((image) => image.toDto());
  }

  @Get('/:imageId')
  @ApiOperation({ summary: 'get image by id' })
  @ApiResponse({ status: 200, type: ImageResponseDto })
  public async getImageById(@Param() params: any): Promise<ImageResponseDto> {
    return this.imageService.getImageById(params.imageId);
  }

  @Get('/:portfolioId')
  @ApiOperation({ summary: 'get images by portfolio id' })
  @ApiResponse({ status: 200, type: Array<ImageResponseDto> })
  public async getImagesByPortfolioId(
    @Param() params: any,
    @Query() query: PaginationDto,
  ): Promise<Array<ImageResponseDto>> {
    const images = await this.imageService.getImagesByPortfolioId(params.portfolioId, query);
    return images.map((image) => image.toDto());
  }

  @Delete('/:imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ description: 'deletion image by id' })
  @ApiResponse({ status: 200 })
  public async deleteImageById(@RequestUser() user: PayloadUser, @Param() params: any): Promise<void> {
    return this.imageService.deleteImageById(params.imageId, user.id);
  }
}
