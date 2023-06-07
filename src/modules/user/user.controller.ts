import { Body, Controller, Post, Delete } from '@nestjs/common/decorators';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthRegisterDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { RequestUser } from '../../shared/decorators/user.decorator';
import { PayloadUser } from '../../shared/payload-user.interface';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post('/create')
  @ApiOperation({ summary: 'User creation endpoint' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  public async createUser(@Body() body: AuthRegisterDto): Promise<UserResponseDto> {
    const user = await this.usersService.createUser(body);
    return user.toDto();
  }

  @Delete('/profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'User deletion endpoint' })
  @ApiResponse({ status: 200 })
  public async deleteProfile(@RequestUser() user: PayloadUser): Promise<void> {
    return this.usersService.deleteProfile(user.email);
  }
}
