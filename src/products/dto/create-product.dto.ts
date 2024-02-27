import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'name', description: 'Product Name' })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({ example: 'description', description: 'Product Description' })
  @IsString()
  @IsNotEmpty()
  readonly description: string;
}
