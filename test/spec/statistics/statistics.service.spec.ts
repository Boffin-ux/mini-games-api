import { Test } from '@nestjs/testing';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { StatisticsService } from '@statistics/statistics.service';
import { mockStats } from '@test/stubs';

describe('StatisticsService unit test', () => {
  let statsService: StatisticsService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [StatisticsService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    prisma = moduleRef.get(PrismaService);
    statsService = moduleRef.get<StatisticsService>(StatisticsService);
  });

  afterEach(() => {
    mockReset(prisma);
  });

  it('should be defined StatsService', () => {
    expect(statsService).toBeDefined();
  });

  it('should define Prisma', () => {
    expect(prisma).toBeDefined();
  });

  describe('create Stats', () => {
    it('should return new stats', async () => {
      prisma.stats.create.mockResolvedValueOnce(mockStats.firstStats);

      await expect(
        statsService.create(mockStats.firstStats, mockStats.firstStats.userId, mockStats.firstStats.productId),
      ).resolves.toEqual(mockStats.firstStats);
    });
  });

  describe('Find All Stats', () => {
    it('should return all statistics', async () => {
      prisma.stats.findMany.mockResolvedValueOnce(mockStats.allStats);

      await expect(statsService.findMany()).resolves.toEqual(mockStats.allStats);
    });
  });

  describe('Find One Stats', () => {
    it('should found statistics by ID', async () => {
      prisma.stats.findUnique.mockResolvedValueOnce(mockStats.firstStats);

      await expect(statsService.findOne(mockStats.firstStats.id)).resolves.toEqual(mockStats.firstStats);
    });
  });

  describe('Find Stats By Product Id', () => {
    it('should found statistics by Product ID', async () => {
      prisma.stats.findMany.mockResolvedValueOnce(mockStats.allStats);

      await expect(statsService.findByProductId(mockStats.firstStats.productId)).resolves.toEqual(mockStats.allStats);
    });
  });

  describe('Find Stats By User Id', () => {
    it('should found statistics by User ID', async () => {
      prisma.stats.findMany.mockResolvedValueOnce(mockStats.allStats);

      await expect(statsService.findByUserId(mockStats.firstStats.userId)).resolves.toEqual(mockStats.allStats);
    });
  });

  describe('Find User Stats By Product Id', () => {
    it('should return user statistics by Product ID', async () => {
      prisma.stats.findMany.mockResolvedValueOnce(mockStats.allStats);

      await expect(
        statsService.userStatsByProductId(mockStats.firstStats.userId, mockStats.firstStats.productId),
      ).resolves.toEqual(mockStats.allStats);
    });
  });

  describe('Find Stats By Product with Field', () => {
    it('should return statistics by product filtered and sorted with selected field.', async () => {
      prisma.stats.findMany.mockResolvedValueOnce(mockStats.allStats);

      await expect(
        statsService.productStatsByField(mockStats.firstStats.productId, mockStats.statsQueryProduct),
      ).resolves.toEqual(mockStats.allStats);
    });
  });

  describe('Find Stats By Product with Fields', () => {
    it('should return statistics by product filtered and sorted with selected fields.', async () => {
      prisma.stats.findMany.mockResolvedValueOnce(mockStats.allStats);

      await expect(
        statsService.productStatsByFields(mockStats.firstStats.productId, mockStats.statsQueriesProduct),
      ).resolves.toEqual(mockStats.allStats);
    });
  });

  describe('Find Stats By User with Field', () => {
    it('should return sorted and filtered statistics by user with selected field.', async () => {
      prisma.stats.findMany.mockResolvedValueOnce(mockStats.allStats);

      await expect(
        statsService.userStatsByField(mockStats.firstStats.userId, mockStats.statsQueryUser),
      ).resolves.toEqual(mockStats.allStats);
    });
  });

  describe('Find Stats By User with Fields', () => {
    it('should return sorted and filtered statistics by user with selected fields.', async () => {
      prisma.stats.findMany.mockResolvedValueOnce(mockStats.allStats);

      await expect(
        statsService.userStatsByFields(mockStats.firstStats.userId, mockStats.statsQueriesUser),
      ).resolves.toEqual(mockStats.allStats);
    });
  });

  describe('Delete Stats by Id', () => {
    it('should delete stats', async () => {
      prisma.stats.delete.mockResolvedValue(mockStats.firstStats);

      await expect(statsService.deleteById(mockStats.firstStats.id, mockStats.firstStats.userId)).resolves.toEqual(
        mockStats.firstStats,
      );
    });
  });
});
