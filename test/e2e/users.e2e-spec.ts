import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { CanActivate, HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from '@src/app.module';
import * as cookieParser from 'cookie-parser';
import { authRoutes, filesRoutes, usersRoutes } from './endpoints';
import { GithubAuthGuard } from '@auth/guards/github-auth.guard';
import { localDto, mockUsers, mockProviderAuthGuard, providerDto } from '@test/stubs';
import { UserAuthData, getUserAuthData } from './utils';
import { PrismaService } from '@prisma/prisma.service';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let httpServer: App;
  let user: UserAuthData;
  let admin: UserAuthData;
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
    await app.close();
  });

  describe(`${usersRoutes.getAll} (GET)`, () => {
    it('should return all users', async () => {
      const { status } = await request(httpServer).get(usersRoutes.getAll).set('Authorization', admin.token);
      expect(status).toBe(HttpStatus.OK);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).get(usersRoutes.getAll);

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${usersRoutes.getUser} (GET)`, () => {
    it('should return user by id', async () => {
      const { status } = await request(httpServer).get(usersRoutes.getUser(user.id)).set('Authorization', user.token);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should respond with Bad Request status code if ID is incorrect', async () => {
      const { status } = await request(httpServer).get(usersRoutes.getUser('test-id')).set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Not Found status code if the user is not found', async () => {
      const { status } = await request(httpServer)
        .get(usersRoutes.getUser(mockUsers.yandexProvider.id))
        .set('Authorization', admin.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).get(usersRoutes.getUser(user.id));

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${usersRoutes.update} (PUT)`, () => {
    it('should upload image', async () => {
      const imagePath = `${__dirname}/assets/testImg.png`;

      const { status } = await request(httpServer)
        .post(filesRoutes.create(user.id))
        .set('Content-Type', 'multipart/form-data')
        .set('Authorization', user.token)
        .attach('file', imagePath);
      expect(status).toBe(HttpStatus.CREATED);
    });

    it('should return updated user', async () => {
      const { status } = await request(httpServer)
        .put(usersRoutes.update(user.id))
        .set('Authorization', user.token)
        .send(localDto.update);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should respond with Bad Request status code if payload not valid', async () => {
      const { status } = await request(httpServer)
        .put(usersRoutes.update(user.id))
        .set('Authorization', user.token)
        .send({ name: '' });

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).put(usersRoutes.update(user.id)).send(localDto.update);

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${usersRoutes.patch} (PATCH)`, () => {
    it('should return the blocked user', async () => {
      const { status } = await request(httpServer)
        .patch(usersRoutes.patch(user.id))
        .query(localDto.blocked)
        .set('Authorization', admin.token);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should return the unlocked user', async () => {
      const { status } = await request(httpServer)
        .patch(usersRoutes.patch(user.id))
        .query(localDto.unblocked)
        .set('Authorization', admin.token);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).patch(usersRoutes.patch(user.id)).query(localDto.unblocked);

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${usersRoutes.remove} (DELETE)`, () => {
    it('should respond with FORBIDDEN status code if the user does not have access', async () => {
      const { status } = await request(httpServer)
        .delete(usersRoutes.remove(admin.id))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should respond with NO CONTENT status code if the LocalUser is successfully deleted', async () => {
      const { status } = await request(httpServer).delete(usersRoutes.remove(user.id)).set('Authorization', user.token);

      expect(status).toBe(HttpStatus.NO_CONTENT);
    });

    it('should respond with NO CONTENT status code if the ProviderUser is successfully deleted', async () => {
      const { status } = await request(httpServer)
        .delete(usersRoutes.remove(admin.id))
        .set('Authorization', admin.token);

      expect(status).toBe(HttpStatus.NO_CONTENT);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).delete(usersRoutes.remove(user.id)).set('Authorization', user.token);

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});
