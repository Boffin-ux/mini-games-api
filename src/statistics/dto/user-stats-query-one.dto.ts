import { IsMongoId } from 'class-validator';
import { StatsQueryOneDto } from '.';

export class UserStatsQueryOneDto extends StatsQueryOneDto {
  @IsMongoId()
  readonly productId: string;
}
