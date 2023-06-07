import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CommentService } from './comment.service';
import { CommentCreateDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommentResponseDto } from './dto/comment.response.dto';
import { RequestUser } from '../../shared/decorators/user.decorator';
import { PayloadUser } from '../../shared/payload-user.interface';

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ description: 'creating new comment for image' })
  @ApiResponse({ status: 201, type: CommentResponseDto })
  public async createComment(
    @RequestUser() user: PayloadUser,
    @Body() body: CommentCreateDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentService.createComment(user.id, body);
    return comment.toDto();
  }

  @Delete('/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ description: 'deletion comment for image' })
  @ApiResponse({ status: 200, type: CommentResponseDto })
  public async deleteComment(@RequestUser() user: PayloadUser, @Param() params: any) {
    return this.commentService.deleteComment(user.id, params.commentId);
  }
}
