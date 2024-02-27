import { ResponseMessages } from '@common/constants';
import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiQuery } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { StatsFields } from '@statistics/enums/stats-fields.enum';

export const ApiStatsQueryOne = () => {
  return applyDecorators(
    ApiQuery({ name: 'field', enum: StatsFields }),
    ApiQuery({ name: 'sortOrder', enum: Prisma.SortOrder }),
    ApiQuery({ name: 'limit', type: Number }),
    ApiBadRequestResponse({
      description: `${ResponseMessages.BAD_REQUEST}`,
    }),
  );
};
