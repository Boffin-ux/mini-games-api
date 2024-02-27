import { UserStatsQueryOneDto } from './dto/user-stats-query-one.dto';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { StatisticsEntity, StatisticsProductEntity, StatisticsUserEntity } from './entities';
import { CreateStatisticsDto, StatsQueryDoubleDto, StatsQueryOneDto, UserStatsQueryDoubleDto } from './dto';
import { ApiStatsQueryDouble, ApiStatsQueryOne } from './decorators';
import { Endpoints, ResponseMessages } from '@common/constants';
import { Access, CurrentUser, ErrorResponse, NoContentResponse, Role } from '@common/decorators';
import { ValidateId, ValidatePayloadExists } from '@common/validations';
import { NotFoundInterceptor } from '@common/interceptors';
import { PrismaExceptionFilter } from '@common/exceptions';
import { UserRole } from '@prisma/client';

@ApiTags('Statistics')
@Controller(Endpoints.STATISTIC)
@UseInterceptors(ClassSerializerInterceptor)
@ApiUnauthorizedResponse({ description: ResponseMessages.UNAUTHORIZED })
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @UseFilters(new PrismaExceptionFilter('Product or User'))
  @ApiOperation({ summary: 'Create statistics' })
  @ApiCreatedResponse({ description: 'Created statistics' })
  @ErrorResponse('Product or User')
  @Post('products/:productId')
  async create(
    @CurrentUser('id') userId: string,
    @Param('productId', ValidateId) productId: string,
    @Body(ValidatePayloadExists) statisticDto: CreateStatisticsDto,
  ) {
    const stats = await this.statisticsService.create(statisticDto, userId, productId);
    return new StatisticsEntity(stats);
  }

  @Role(UserRole.Admin)
  @ApiOperation({ summary: 'Get All statistics' })
  @ApiOkResponse({ description: 'All statistics' })
  @Get()
  async getAll() {
    const stats = await this.statisticsService.findMany();
    return stats.map((item) => new StatisticsUserEntity(item));
  }

  @UseInterceptors(new NotFoundInterceptor('Statistics'))
  @ApiOperation({ summary: 'Get Statistics by ID' })
  @ApiOkResponse({ description: 'Founded statistics' })
  @ErrorResponse('Statistics')
  @Get(':statsId')
  async getStatistics(@Param('statsId', ValidateId) id: string) {
    const stats = await this.statisticsService.findOne(id);
    return stats && new StatisticsUserEntity(stats);
  }

  @ApiOperation({ summary: 'Get All Statistics by product' })
  @ApiOkResponse({ description: 'Founded statistics' })
  @ApiBadRequestResponse({ description: `${ResponseMessages.BAD_REQUEST}` })
  @Get('products/:productId')
  async statsByProduct(@Param('productId', ValidateId) productId: string) {
    const stats = await this.statisticsService.findByProductId(productId);
    return stats.map((item) => new StatisticsUserEntity(item));
  }

  @ApiStatsQueryOne()
  @ApiOperation({ summary: 'Get Product statistics filtered and sorted by selected field.' })
  @ApiOkResponse({ description: 'Get Product statistics filtered and sorted by selected field.' })
  @Get('products/:productId/sortByField')
  async productStatsByField(@Param('productId', ValidateId) productId: string, @Query() queryParams: StatsQueryOneDto) {
    const stats = await this.statisticsService.productStatsByField(productId, queryParams);
    return stats.map((item) => new StatisticsUserEntity(item));
  }

  @ApiStatsQueryDouble()
  @ApiOperation({ summary: 'Get Product statistics filtered and sorted by selected fields.' })
  @ApiOkResponse({ description: 'Filtered and Sorted statistics' })
  @Get('products/:productId/sortByFields')
  async productStatsByFields(
    @Param('productId', ValidateId) productId: string,
    @Query() queryParams: StatsQueryDoubleDto,
  ) {
    const stats = await this.statisticsService.productStatsByFields(productId, queryParams);
    return stats.map((item) => new StatisticsUserEntity(item));
  }

  @Access()
  @ApiQuery({ name: 'productId', type: String })
  @ApiOperation({ summary: 'Get user statistics by product' })
  @ApiOkResponse({ description: 'Founded statistics' })
  @ErrorResponse('Products')
  @Get('products/:productId/users/:userId')
  async userStatsByProduct(
    @Param('userId', ValidateId) userId: string,
    @Param('productId', ValidateId) productId: string,
  ) {
    const stats = await this.statisticsService.userStatsByProductId(userId, productId);
    return stats.map((item) => new StatisticsProductEntity(item));
  }

  @Access()
  @ApiOperation({ summary: 'Get All Statistics by user' })
  @ApiOkResponse({ description: 'Founded statistics' })
  @ErrorResponse('Products')
  @Get('users/:userId')
  async statsByUser(@Param('userId', ValidateId) userId: string) {
    const stats = await this.statisticsService.findByUserId(userId);
    return stats.map((item) => new StatisticsProductEntity(item));
  }

  @Access()
  @ApiStatsQueryOne()
  @ApiQuery({ name: 'productId', type: String })
  @ApiOperation({ summary: 'Get User statistics by product filtered and sorted by selected field.' })
  @ApiOkResponse({ description: 'Filtered and Sorted statistics' })
  @Get('users/:userId/sortByField')
  async userStatsByField(@Param('userId', ValidateId) userId: string, @Query() queryParams: UserStatsQueryOneDto) {
    const stats = await this.statisticsService.userStatsByField(userId, queryParams);
    return stats.map((item) => new StatisticsProductEntity(item));
  }

  @Access()
  @ApiStatsQueryDouble()
  @ApiQuery({ name: 'productId', type: String })
  @ApiOperation({ summary: 'Get User statistics by product filtered and sorted by selected fields.' })
  @ApiOkResponse({ description: 'Filtered and Sorted statistics.' })
  @Get('users/:userId/sortByFields')
  async userStatsByFields(@Param('userId', ValidateId) userId: string, @Query() queryParams: UserStatsQueryDoubleDto) {
    const stats = await this.statisticsService.userStatsByFields(userId, queryParams);
    return stats.map((item) => new StatisticsProductEntity(item));
  }

  @Access()
  @UseFilters(new PrismaExceptionFilter('Statistics'))
  @NoContentResponse('Statistics')
  @ErrorResponse('Statistics')
  @Delete(':statsId/users/:userId')
  async remove(@Param('statsId', ValidateId) id: string, @Param('userId', ValidateId) userId: string) {
    const stats = await this.statisticsService.deleteById(id, userId);
    return new StatisticsUserEntity(stats);
  }
}
