import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from '../../user/dto/user.response.dto';

export class AuthResponseDto {
  constructor(user: UserResponseDto, token: string) {
    this.user = user;
    this.token = token;
  }

  @ApiProperty({ example: 'User{ \n... \n... \n}' })
  public user: UserResponseDto;

  @ApiProperty({ example: 'Bearer ...', description: 'jwt token' })
  public token: string;
}
