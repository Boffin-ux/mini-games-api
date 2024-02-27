import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { CanActivate, HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from '@src/app.module';
import * as cookieParser from 'cookie-parser';
import { authRoutes, productsRoutes } from './endpoints';
import { GithubAuthGuard } from '@auth/guards/github-auth.guard';
import { mockProviderAuthGuard, providerDto, productDto, mockProducts, localDto } from '@test/stubs';
import { UserAuthData, getUserAuthData } from './utils';
import { Product } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let httpServer: App;
  let user: UserAuthData;
  let admin: UserAuthData;
  let product: Product;
  let prisma: PrismaService;
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

  describe(`${productsRoutes.create} (POST)`, () => {
    it('should create product', async () => {
      const { status, body } = await request(httpServer)
        .post(productsRoutes.create)
        .set('Authorization', admin.token)
        .send(productDto.create);
      expect(status).toBe(HttpStatus.CREATED);

      product = body;
    });

    it('should respond with PrismaClientKnownRequestError status code if name already exist', async () => {
      const { status } = await request(httpServer)
        .post(productsRoutes.create)
        .set('Authorization', admin.token)
        .send(productDto.create);
      expect(status).toBe(HttpStatus.CONFLICT);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).post(productsRoutes.create).send(productDto.create);
      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with FORBIDDEN status code if the user does not have access', async () => {
      const { status } = await request(httpServer)
        .post(productsRoutes.create)
        .set('Authorization', user.token)
        .send(productDto.create);
      expect(status).toBe(HttpStatus.FORBIDDEN);
    });
  });

  describe(`${productsRoutes.getProduct} (GET)`, () => {
    it('should return product by id', async () => {
      const { status } = await request(httpServer)
        .get(productsRoutes.getProduct(product.id))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should respond with Bad Request status code if ID is incorrect', async () => {
      const { status } = await request(httpServer)
        .get(productsRoutes.getProduct('test-id'))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Not Found status code if the product is not found', async () => {
      const { status } = await request(httpServer)
        .get(productsRoutes.getProduct(mockProducts.secondProduct.id))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).get(productsRoutes.getProduct(product.id));

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${productsRoutes.getAll} (GET)`, () => {
    it('should return All products', async () => {
      const { status } = await request(httpServer).get(productsRoutes.getAll).set('Authorization', user.token);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).get(productsRoutes.getAll);

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${productsRoutes.update} (PUT)`, () => {
    it('should return updated user', async () => {
      const { status } = await request(httpServer)
        .put(productsRoutes.update(product.id))
        .set('Authorization', admin.token)
        .send(productDto.update);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should respond with Bad Request status code if payload not valid', async () => {
      const { status } = await request(httpServer)
        .put(productsRoutes.update(product.id))
        .set('Authorization', admin.token)
        .send({ name: '' });

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Bad Request status code if ID is incorrect', async () => {
      const { status } = await request(httpServer)
        .put(productsRoutes.update('test-id'))
        .set('Authorization', admin.token)
        .send(productDto.update);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with FORBIDDEN status code if the user does not have access', async () => {
      const { status } = await request(httpServer)
        .put(productsRoutes.update(product.id))
        .set('Authorization', user.token)
        .send(productDto.update);

      expect(status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).put(productsRoutes.update(product.id)).send(productDto.update);

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${productsRoutes.delete} (DELETE)`, () => {
    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).delete(productsRoutes.delete(product.id));

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with FORBIDDEN status code if the user does not have access', async () => {
      const { status } = await request(httpServer)
        .delete(productsRoutes.delete(product.id))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should respond with Bad Request status code if ID is incorrect', async () => {
      const { status } = await request(httpServer)
        .delete(productsRoutes.delete('test-id'))
        .set('Authorization', admin.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with NO CONTENT status code if the product is successfully deleted', async () => {
      const { status } = await request(httpServer)
        .delete(productsRoutes.delete(product.id))
        .set('Authorization', admin.token);

      expect(status).toBe(HttpStatus.NO_CONTENT);
    });
  });
});
