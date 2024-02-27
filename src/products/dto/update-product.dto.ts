import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({ example: 'name', description: 'Product Name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @ApiProperty({ example: 'description', description: 'Product Description' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly description?: string;
}
