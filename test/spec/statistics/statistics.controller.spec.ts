import { Test } from '@nestjs/testing';
import { StatisticsService } from '@statistics/statistics.service';
import { StatisticsController } from '@statistics/statistics.controller';
import { statisticsService } from '@test/__mocks__';
import { mockStats } from '@test/stubs';

describe('StatisticsController unit test', () => {
  let statsController: StatisticsController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [StatisticsController],
    })
      .useMocker((token) => {
        if (token === StatisticsService) {
          return statisticsService;
        }
      })
      .compile();

    statsController = moduleRef.get<StatisticsController>(StatisticsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined StatsService', () => {
    expect(statsController).toBeDefined();
  });

  describe('create Stats', () => {
    it('should return new stats', async () => {
      await expect(
        statsController.create(mockStats.firstStats.userId, mockStats.firstStats.productId, mockStats.firstStats),
      ).resolves.toEqual(mockStats.firstStats);
    });
  });

  describe('Get All Stats', () => {
    it('should return all statistics', async () => {
      await expect(statsController.getAll()).resolves.toEqual(mockStats.allStats);
    });
  });

  describe('Get Stats by ID', () => {
    it('should return statistics by ID', async () => {
      await expect(statsController.getStatistics(mockStats.firstStats.id)).resolves.toEqual(mockStats.firstStats);
    });
  });

  describe('Get Stats By Product Id', () => {
    it('should return statistics by Product ID', async () => {
      await expect(statsController.statsByProduct(mockStats.firstStats.productId)).resolves.toEqual(mockStats.allStats);
    });
  });

  describe('Get Stats By User Id', () => {
    it('should found statistics by User ID', async () => {
      await expect(statsController.statsByUser(mockStats.firstStats.userId)).resolves.toEqual(mockStats.allStats);
    });
  });

  describe('Get User Stats By Product Id', () => {
    it('should return user statistics by Product ID', async () => {
      await expect(
        statsController.userStatsByProduct(mockStats.firstStats.userId, mockStats.firstStats.productId),
      ).resolves.toEqual(mockStats.allStats);
    });
  });

  describe('Get Stats By Product with Field', () => {
    it('should return statistics by product filtered and sorted with selected field.', async () => {
      await expect(
        statsController.productStatsByField(mockStats.firstStats.productId, mockStats.statsQueryProduct),
      ).resolves.toEqual(mockStats.allStats);
    });
  });

  describe('Get Stats By Product with Fields', () => {
    it('should return statistics by product filtered and sorted with selected fields.', async () => {
      await expect(
        statsController.productStatsByFields(mockStats.firstStats.productId, mockStats.statsQueriesProduct),
      ).resolves.toEqual(mockStats.allStats);
    });
  });

  describe('Get Stats By User with Field', () => {
    it('should return sorted and filtered statistics by user with selected field.', async () => {
      await expect(
        statsController.userStatsByField(mockStats.firstStats.userId, mockStats.statsQueryUser),
      ).resolves.toEqual(mockStats.allStats);
    });
  });

  describe('Get Stats By User with Fields', () => {
    it('should return sorted and filtered statistics by user with selected fields.', async () => {
      await expect(
        statsController.userStatsByFields(mockStats.firstStats.userId, mockStats.statsQueriesUser),
      ).resolves.toEqual(mockStats.allStats);
    });
  });

  describe('Delete Stats by Id', () => {
    it('should delete stats', async () => {
      await expect(statsController.remove(mockStats.firstStats.id, mockStats.firstStats.userId)).resolves.toEqual(
        mockStats.firstStats,
      );
    });
  });
});
