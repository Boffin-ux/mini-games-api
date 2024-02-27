import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'User', description: 'User Name' })
  @IsOptional()
  @IsString()
  @Length(4, 12, { message: 'Name length min 4, max 12' })
  readonly name?: string;

  @ApiProperty({ example: '1234User', description: 'User Password' })
  @IsOptional()
  @IsString()
  @Length(4, 16, { message: 'password length min 4, max 16' })
  readonly password?: string;
}
