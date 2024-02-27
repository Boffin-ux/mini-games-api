import { Prisma, Stats } from '@prisma/client';
import { mockProducts, mockUsers } from '.';
import { StatsFields } from '@statistics/enums/stats-fields.enum';
import {
  CreateStatisticsDto,
  StatsQueryDoubleDto,
  StatsQueryOneDto,
  UserStatsQueryDoubleDto,
  UserStatsQueryOneDto,
} from '@statistics/dto';

type StatsQueryOneType = StatsQueryOneDto | UserStatsQueryOneDto;
type StatsQueryDoubleType = StatsQueryDoubleDto | UserStatsQueryDoubleDto;

const statsStub = (): Stats[] => {
  return [
    {
      id: '65645877981cf1227b08e9fd',
      createdAt: new Date('2024-01-01'),
      level: 1,
      totalTime: '00:04:07',
      score: 510,
      other: 'somebody-01',
      userId: mockUsers.localUser.id,
      productId: mockProducts.firstProduct.id,
    },
    {
      id: '65645a9394aa697eb600b8f1',
      createdAt: new Date('2024-01-01'),
      level: 1,
      totalTime: '00:08:31',
      score: 230,
      other: 'somebody-02',
      userId: mockUsers.githubProvider.id,
      productId: mockProducts.secondProduct.id,
    },
  ];
};

const statsQueryOneStub = (): StatsQueryOneType[] => {
  return [
    {
      productId: mockProducts.firstProduct.id,
      field: StatsFields.score,
      sortOrder: Prisma.SortOrder.desc,
      limit: 10,
    },
    {
      field: StatsFields.score,
      sortOrder: Prisma.SortOrder.desc,
      limit: 10,
    },
  ];
};

const statsQueryDoubleStub = (): StatsQueryDoubleType[] => {
  return [
    {
      productId: mockProducts.firstProduct.id,
      mainField: StatsFields.totalTime,
      mainSortOrder: Prisma.SortOrder.asc,
      secondField: StatsFields.score,
      secondSortOrder: Prisma.SortOrder.desc,
      limit: 10,
    },
    {
      mainField: StatsFields.totalTime,
      mainSortOrder: Prisma.SortOrder.asc,
      secondField: StatsFields.score,
      secondSortOrder: Prisma.SortOrder.desc,
      limit: 10,
    },
  ];
};

const mockStats = {
  allStats: <Stats[]>statsStub(),
  firstStats: <Stats>statsStub()[0],
  secondStats: <Stats>statsStub()[1],
  statsQueryUser: <UserStatsQueryOneDto>statsQueryOneStub()[0],
  statsQueriesUser: <UserStatsQueryDoubleDto>statsQueryDoubleStub()[0],
  statsQueriesProduct: <StatsQueryDoubleDto>statsQueryDoubleStub()[1],
  statsQueryProduct: <StatsQueryOneDto>statsQueryOneStub()[1],
} as const;

const statsDto = {
  create: <CreateStatisticsDto>{
    level: mockStats.firstStats.level,
    totalTime: mockStats.firstStats.totalTime,
    score: mockStats.firstStats.score,
    other: mockStats.firstStats.other,
  },
  createPart: <Partial<CreateStatisticsDto>>{
    level: mockStats.firstStats.level,
    totalTime: mockStats.firstStats.totalTime,
  },
  createBadPayload: <Partial<CreateStatisticsDto>>{
    level: mockStats.firstStats.level,
  },
} as const;

export { mockStats, statsDto, StatsQueryOneType, StatsQueryDoubleType };
