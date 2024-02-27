import { Prisma } from '@prisma/client';
import { StatsFields } from '@statistics/enums/stats-fields.enum';
import { Type } from 'class-transformer';
import { IsEnum, IsPositive } from 'class-validator';

export class StatsQueryDoubleDto {
  @IsEnum(StatsFields)
  readonly mainField: StatsFields;

  @IsEnum(Prisma.SortOrder)
  readonly mainSortOrder: Prisma.SortOrder;

  @IsEnum(StatsFields)
  readonly secondField: StatsFields;

  @IsEnum(Prisma.SortOrder)
  readonly secondSortOrder: Prisma.SortOrder;

  @IsPositive()
  @Type(() => Number)
  readonly limit: number;
}
