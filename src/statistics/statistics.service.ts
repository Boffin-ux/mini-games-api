import { Injectable } from '@nestjs/common';
import { CreateStatisticsDto } from './dto/create-statistic.dto';
import { PrismaService } from '@prisma/prisma.service';
import { StatsQueryDoubleDto, StatsQueryOneDto, UserStatsQueryDoubleDto, UserStatsQueryOneDto } from './dto';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async create(statsDto: CreateStatisticsDto, userId: string, productId: string) {
    const stats = await this.prisma.stats.create({
      data: {
        ...statsDto,
        user: {
          connect: {
            id: userId,
          },
        },
        product: {
          connect: {
            id: productId,
          },
        },
      },
    });

    return stats;
  }

  async findOne(id: string) {
    return await this.prisma.stats.findUnique({ where: { id }, include: { product: true, user: true } });
  }

  async findMany() {
    return await this.prisma.stats.findMany({
      include: { product: true, user: true },
    });
  }

  async findByProductId(productId: string) {
    return await this.prisma.stats.findMany({
      where: { productId },
      include: { user: true },
    });
  }

  async productStatsByField(productId: string, { field, sortOrder, limit }: StatsQueryOneDto) {
    return await this.prisma.stats.findMany({
      take: limit,
      where: { productId, [field]: { not: null }, user: { isNot: { isBlocked: true } } },
      orderBy: { [field]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  async productStatsByFields(productId: string, queryParams: StatsQueryDoubleDto) {
    const { mainField, secondField, mainSortOrder, secondSortOrder, limit } = queryParams;
    return await this.prisma.stats.findMany({
      take: limit,
      where: {
        productId,
        [mainField]: { not: null },
        [secondField]: { not: null },
        user: { isNot: { isBlocked: true } },
      },
      orderBy: [{ [mainField]: mainSortOrder }, { [secondField]: secondSortOrder }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return await this.prisma.stats.findMany({
      where: { userId },
      include: { product: true },
    });
  }

  async userStatsByProductId(userId: string, productId: string) {
    return await this.prisma.stats.findMany({
      where: { userId, productId },
      include: { product: true },
    });
  }

  async userStatsByField(userId: string, { productId, field, sortOrder, limit }: UserStatsQueryOneDto) {
    return await this.prisma.stats.findMany({
      take: limit,
      where: { userId, productId, [field]: { not: null } },
      orderBy: { [field]: sortOrder },
      include: { product: true },
    });
  }

  async userStatsByFields(userId: string, queryParams: UserStatsQueryDoubleDto) {
    const { productId, mainField, secondField, mainSortOrder, secondSortOrder, limit } = queryParams;
    return await this.prisma.stats.findMany({
      take: limit,
      where: { userId, productId, [mainField]: { not: null }, [secondField]: { not: null } },
      orderBy: [{ [mainField]: mainSortOrder }, { [secondField]: secondSortOrder }],
      include: { product: true },
    });
  }

  async deleteById(id: string, userId: string) {
    return await this.prisma.stats.delete({ where: { id, userId } });
  }
}
