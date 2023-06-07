import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthLoginDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'email address is not valid' })
  @ApiProperty({ example: 'user@domain.com' })
  public email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 64, { message: 'password must be in range 8 to 64' })
  @ApiProperty({ example: 'qwerty123' })
  public password: string;
}
