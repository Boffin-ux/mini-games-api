import { ResponseMessages } from '@common/constants';
import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiQuery } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { StatsFields } from '@statistics/enums/stats-fields.enum';

export const ApiStatsQueryDouble = () => {
  return applyDecorators(
    ApiQuery({ name: 'mainField', enum: StatsFields }),
    ApiQuery({ name: 'mainSortOrder', enum: Prisma.SortOrder }),
    ApiQuery({ name: 'secondField', enum: StatsFields }),
    ApiQuery({ name: 'secondSortOrder', enum: Prisma.SortOrder }),
    ApiQuery({ name: 'limit', type: Number }),
    ApiBadRequestResponse({
      description: `${ResponseMessages.BAD_REQUEST}`,
    }),
  );
};
