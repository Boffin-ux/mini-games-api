import { Test } from '@nestjs/testing';
import { PrismaService } from '@prisma/prisma.service';

describe('PrismaService unit tests', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('should be defined onModuleInit', async () => {
    const prismaInit = jest.spyOn(prismaService, 'onModuleInit');
    prismaService.onModuleInit();
    expect(prismaInit).toHaveBeenCalledTimes(1);
  });
});
