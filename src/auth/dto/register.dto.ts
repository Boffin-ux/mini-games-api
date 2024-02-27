import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Length, IsEmail, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@mail.com', description: 'User Email' })
  @IsString()
  @IsEmail({}, { message: 'Incorrect email' })
  readonly email: string;

  @ApiPropertyOptional({ example: 'User', description: 'User Name' })
  @IsString()
  @Length(4, 16, { message: 'Name length min 4, max 16' })
  readonly name: string;

  @ApiPropertyOptional({ example: '1234User', description: 'User Password' })
  @IsOptional()
  @IsString()
  @Length(6, 18, { message: 'Password length min 6, max 18' })
  readonly password?: string;
}
