import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthRegisterDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'email address is not valid' })
  @ApiProperty({ example: 'admin@local.com' })
  public email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 64, { message: 'password must be in range 8 to 64' })
  @ApiProperty({ example: 'password' })
  public password: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Winston Smith' })
  public fullName?: string;
}
