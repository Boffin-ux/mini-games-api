import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { CanActivate, HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from '@src/app.module';
import * as cookieParser from 'cookie-parser';
import { authRoutes, productsRoutes, statsRoutes } from './endpoints';
import { GithubAuthGuard } from '@auth/guards/github-auth.guard';
import { mockProviderAuthGuard, providerDto, productDto, localDto, statsDto, mockStats } from '@test/stubs';
import { UserAuthData, getUserAuthData } from './utils';
import { Product, Stats } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { UserStatsQueryDoubleDto, UserStatsQueryOneDto } from '@statistics/dto';

describe('Statistics (e2e)', () => {
  let app: INestApplication;
  let httpServer: App;
  let user: UserAuthData;
  let admin: UserAuthData;
  let product: Product;
  let stats: Stats;
  let prisma: PrismaService;
  let userQueryParams: UserStatsQueryOneDto;
  let userQueriesParams: UserStatsQueryDoubleDto;
  const incorrectId = 'test-id';
  const mockGithubAuthGuard: CanActivate = mockProviderAuthGuard(providerDto.github);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, ConfigModule.forRoot({ cache: true, isGlobal: true, expandVariables: true })],
    })
      .overrideGuard(GithubAuthGuard)
      .useValue(mockGithubAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    httpServer = app.getHttpServer();

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, always: true, transform: true }),
    );
    app.use(cookieParser());

    await app.init();

    user = await getUserAuthData(httpServer, authRoutes.signup, localDto.register);
    admin = await getUserAuthData(httpServer, authRoutes.githubRedirect);
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.product.deleteMany();

    await app.close();
  });

  describe(`${statsRoutes.create} (POST)`, () => {
    it('should create product', async () => {
      const { status, body } = await request(httpServer)
        .post(productsRoutes.create)
        .set('Authorization', admin.token)
        .send(productDto.create);
      expect(status).toBe(HttpStatus.CREATED);

      product = body;
      const { statsQueryUser, statsQueriesUser } = mockStats;
      userQueryParams = { ...statsQueryUser, productId: product.id };
      userQueriesParams = { ...statsQueriesUser, productId: product.id };
    });

    it('should create stats by user', async () => {
      const { status, body } = await request(httpServer)
        .post(statsRoutes.create(product.id))
        .set('Authorization', user.token)
        .send(statsDto.create);
      stats = body;
      expect(status).toBe(HttpStatus.CREATED);
    });

    it('should create stats by admin', async () => {
      const { status } = await request(httpServer)
        .post(statsRoutes.create(product.id))
        .set('Authorization', admin.token)
        .send(statsDto.createPart);
      expect(status).toBe(HttpStatus.CREATED);
    });

    it('should respond with Bad Request status code if Payload not valid', async () => {
      const { status } = await request(httpServer)
        .post(statsRoutes.create(product.id))
        .set('Authorization', user.token)
        .send(statsDto.createBadPayload);
      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).post(statsRoutes.create(product.id)).send(statsDto.create);

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${statsRoutes.getAll} (GET)`, () => {
    it('should return all stats for admin', async () => {
      const { status } = await request(httpServer).get(statsRoutes.getAll).set('Authorization', admin.token);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should respond with FORBIDDEN status code for user', async () => {
      const { status } = await request(httpServer).get(statsRoutes.getAll).set('Authorization', user.token);

      expect(status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).get(statsRoutes.getAll);

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${statsRoutes.getStatistics} (GET)`, () => {
    it('should return stats by id', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.getStatistics(stats.id))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).get(statsRoutes.getStatistics(stats.id));

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with Bad Request status code if ID is incorrect', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.getStatistics(incorrectId))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Not Found status code if the stats is not found', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.getStatistics(mockStats.secondStats.id))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe(`${statsRoutes.statsByProduct} (GET)`, () => {
    it('should return stats by product id', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.statsByProduct(product.id))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should respond with Bad Request status code if ID is incorrect', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.statsByProduct(incorrectId))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return empty array if there is no data', async () => {
      const { status, body } = await request(httpServer)
        .get(statsRoutes.statsByProduct(mockStats.secondStats.productId))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.OK);
      expect(body).toEqual([]);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).get(statsRoutes.statsByProduct(product.id));

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${statsRoutes.productStatsByField} (GET)`, () => {
    const queryParams = mockStats.statsQueryProduct;

    it('should return product stats filtered and sorted by selected field', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.productStatsByField(product.id))
        .query(queryParams)
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should respond with Bad Request status code if not query fields', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.productStatsByField(product.id))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Bad Request status code if ID is incorrect', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.productStatsByField(incorrectId))
        .query(queryParams)
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).get(statsRoutes.productStatsByField(product.id)).query(queryParams);

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${statsRoutes.productStatsByFields} (GET)`, () => {
    const queryParams = mockStats.statsQueriesProduct;

    it('should return product stats filtered and sorted by selected fields', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.productStatsByFields(product.id))
        .query(queryParams)
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should respond with Bad Request status code if not query fields', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.productStatsByFields(product.id))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Bad Request status code if ID is incorrect', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.productStatsByField(incorrectId))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).get(statsRoutes.productStatsByField(product.id));

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${statsRoutes.userStatsByProduct} (GET)`, () => {
    it('should return user stats by product', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.userStatsByProduct(product.id, user.id))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should respond with Bad Request status code if product ID is incorrect', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.userStatsByProduct(incorrectId, user.id))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Bad Request status code if user ID is incorrect', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.userStatsByProduct(product.id, incorrectId))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with FORBIDDEN status code if the user does not have access', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.userStatsByProduct(product.id, admin.id))
        .set('Authorization', user.token);
      expect(status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).get(statsRoutes.userStatsByProduct(product.id, user.id));

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${statsRoutes.statsByUser} (GET)`, () => {
    it('should return all user stats', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.statsByUser(user.id))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should respond with Bad Request status code if user ID is incorrect', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.statsByUser(incorrectId))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with FORBIDDEN status code if the user does not have access', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.statsByUser(admin.id))
        .set('Authorization', user.token);
      expect(status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).get(statsRoutes.statsByUser(user.id));

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${statsRoutes.userStatsByField} (GET)`, () => {
    it('should return user stats by product filtered and sorted by selected field', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.userStatsByField(user.id))
        .query(userQueryParams)
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should respond with Bad Request status code if user ID is incorrect', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.userStatsByField(incorrectId))
        .query(userQueryParams)
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Bad Request status code if not query fields', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.userStatsByField(user.id))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Bad Request status code if query fields not valid', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.userStatsByField(user.id))
        .query(mockStats.statsQueriesUser)
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with FORBIDDEN status code if the user does not have access', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.userStatsByField(admin.id))
        .query(userQueryParams)
        .set('Authorization', user.token);
      expect(status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).get(statsRoutes.userStatsByField(user.id)).query(userQueryParams);

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${statsRoutes.userStatsByFields} (GET)`, () => {
    it('should return user stats by product filtered and sorted by selected field', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.userStatsByFields(user.id))
        .query(userQueriesParams)
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should respond with Bad Request status code if user ID is incorrect', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.userStatsByFields(incorrectId))
        .query(userQueriesParams)
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Bad Request status code if query fields not valid', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.userStatsByFields(user.id))
        .query(mockStats.statsQueryUser)
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Bad Request status code if not query fields', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.userStatsByFields(user.id))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with FORBIDDEN status code if the user does not have access', async () => {
      const { status } = await request(httpServer)
        .get(statsRoutes.userStatsByFields(admin.id))
        .query(userQueriesParams)
        .set('Authorization', user.token);
      expect(status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).get(statsRoutes.userStatsByFields(user.id)).query(userQueriesParams);

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${statsRoutes.delete} (DELETE)`, () => {
    it('should respond with NO CONTENT status code if the user stats is successfully deleted', async () => {
      const { status } = await request(httpServer)
        .delete(statsRoutes.delete(stats.id, user.id))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.NO_CONTENT);
    });

    it('should respond with Bad Request status code if stats ID is incorrect', async () => {
      const { status } = await request(httpServer)
        .delete(statsRoutes.delete(incorrectId, user.id))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Bad Request status code if user ID is incorrect', async () => {
      const { status } = await request(httpServer)
        .delete(statsRoutes.delete(stats.id, incorrectId))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with FORBIDDEN status code if the user does not have access', async () => {
      const { status } = await request(httpServer)
        .delete(statsRoutes.delete(stats.id, admin.id))
        .set('Authorization', user.token);
      expect(status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).delete(statsRoutes.delete(stats.id, user.id));

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});
