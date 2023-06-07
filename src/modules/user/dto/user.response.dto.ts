import { ApiProperty } from '@nestjs/swagger';

import { User } from '../user.model';

export class UserResponseDto {
  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.fullName = user.fullName;
  }

  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'user@domain.com' })
  email: string;

  @ApiProperty({ example: 'Winston Smith' })
  fullName: string;
}
