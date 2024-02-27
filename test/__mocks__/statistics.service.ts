import { mockStats } from '@test/stubs';

export const statisticsService = {
  findMany: jest.fn().mockResolvedValue(mockStats.allStats),
  findOne: jest.fn().mockResolvedValue(mockStats.firstStats),
  create: jest.fn().mockResolvedValue(mockStats.firstStats),
  findByProductId: jest.fn().mockReturnValue(mockStats.allStats),
  productStatsByField: jest.fn().mockResolvedValue(mockStats.allStats),
  productStatsByFields: jest.fn().mockResolvedValue(mockStats.allStats),
  findByUserId: jest.fn().mockReturnValue(mockStats.allStats),
  userStatsByProductId: jest.fn().mockReturnValue(mockStats.allStats),
  userStatsByField: jest.fn().mockReturnValue(mockStats.allStats),
  userStatsByFields: jest.fn().mockReturnValue(mockStats.allStats),
  deleteById: jest.fn().mockReturnValue(mockStats.firstStats),
};
