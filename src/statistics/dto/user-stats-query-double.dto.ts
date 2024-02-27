import { IsMongoId } from 'class-validator';
import { StatsQueryDoubleDto } from '.';

export class UserStatsQueryDoubleDto extends StatsQueryDoubleDto {
  @IsMongoId()
  readonly productId: string;
}
