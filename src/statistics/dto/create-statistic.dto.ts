import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CreateStatisticsDto {
  @Min(1)
  @Max(100)
  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  readonly level: number;

  @ApiProperty({ example: '00:04:07' })
  @IsOptional()
  @IsString()
  @Matches(/^(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)$/, { message: 'totalTime must match format hh:mm:ss' })
  readonly totalTime: string | null;

  @ApiProperty({ example: 520 })
  @IsOptional()
  @IsNumber()
  readonly score: number | null;

  @ApiProperty({ example: 'Any string value' })
  @IsOptional()
  @IsString()
  readonly other: string | null;
}
