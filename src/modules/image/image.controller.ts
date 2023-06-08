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
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ImageService } from './image.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationUtility } from '../../shared/utils/pagination.utility';

import { ImageCreateDto } from './dto/create-image.dto';
import { PaginationDto } from '../../shared/pagination.dto';
import { ImageResponseDto } from './dto/image.response.dto';
import { RequestUser } from '../../shared/decorators/user.decorator';
import { PayloadUser } from '../../shared/payload-user.interface';
import { PaginatedResponseDto } from '../../shared/dto/paginated-response.dto';

@ApiTags('Images')
@Controller('images')
export class ImageController {
  private paginationUtil: PaginationUtility;

  constructor(private readonly imageService: ImageService, private configService: ConfigService) {
    const defaultPerPage = Number(configService.get('DEFAULT_PER_PAGE'));
    this.paginationUtil = new PaginationUtility(defaultPerPage);
  }

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
  public async getImagesFeed(@Query() query: PaginationDto): Promise<PaginatedResponseDto<ImageResponseDto>> {
    const sequelizeQuery = this.paginationUtil.parse(query);
    const { data, total } = await this.imageService.getImagesFeed(sequelizeQuery);

    return {
      page: sequelizeQuery.page,
      perPage: sequelizeQuery.limit,
      totalPages: Math.ceil(total / sequelizeQuery.limit),
      total,
      data: data.map((f) => f.toDto()),
    };
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
  ): Promise<PaginatedResponseDto<ImageResponseDto>> {
    const sequelizeQuery = this.paginationUtil.parse(query);
    const { data, total } = await this.imageService.getImagesByPortfolioId(params.portfolioId, sequelizeQuery);

    return {
      page: sequelizeQuery.page,
      perPage: sequelizeQuery.limit,
      totalPages: Math.ceil(total / sequelizeQuery.limit),
      total,
      data: data.map((f) => f.toDto()),
    };
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
