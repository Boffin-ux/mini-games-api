import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@mail.com', description: 'User Email' })
  @IsString()
  @IsEmail({}, { message: 'Incorrect email' })
  readonly email: string;

  @ApiPropertyOptional({ example: '1234User', description: 'User Password' })
  @IsString()
  @Length(6, 18, { message: 'Password length min 6, max 18' })
  readonly password: string;
}
