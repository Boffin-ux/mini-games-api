import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { CanActivate, HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from '@src/app.module';
import * as cookieParser from 'cookie-parser';
import { authRoutes, filesRoutes } from './endpoints';
import { GithubAuthGuard } from '@auth/guards/github-auth.guard';
import { localDto, mockProviderAuthGuard, mockUsers, providerDto } from '@test/stubs';
import { UserAuthData, getUserAuthData } from './utils';
import { FilesService } from '@files/files.service';
import { YandexAuthGuard } from '@auth/guards/yandex-auth.guard';
import { GoogleAuthGuard } from '@auth/guards/google-auth.guard';
import { PrismaService } from '@prisma/prisma.service';

describe('Files (e2e)', () => {
  let app: INestApplication;
  let httpServer: App;
  let user: UserAuthData;
  let yaWithBadImg: UserAuthData;
  let githubWithBadImg: UserAuthData;
  let admin: UserAuthData;
  let filesService: FilesService;
  let prisma: PrismaService;
  let img: string;
  const mockGoogleAuthGuard: CanActivate = mockProviderAuthGuard(providerDto.google);
  const mockGithubAuthGuard: CanActivate = mockProviderAuthGuard(providerDto.githubBadImg);
  const mockYandexAuthGuard: CanActivate = mockProviderAuthGuard(providerDto.yandexBadImg);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, ConfigModule.forRoot({ cache: true, isGlobal: true, expandVariables: true })],
    })
      .overrideGuard(GoogleAuthGuard)
      .useValue(mockGoogleAuthGuard)
      .overrideGuard(GithubAuthGuard)
      .useValue(mockGithubAuthGuard)
      .overrideGuard(YandexAuthGuard)
      .useValue(mockYandexAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    filesService = app.get<FilesService>(FilesService);
    prisma = app.get<PrismaService>(PrismaService);
    httpServer = app.getHttpServer();

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, always: true, transform: true }),
    );
    app.use(cookieParser());

    await app.init();

    user = await getUserAuthData(httpServer, authRoutes.signup, localDto.register);
    admin = await getUserAuthData(httpServer, authRoutes.googleRedirect);
    githubWithBadImg = await getUserAuthData(httpServer, authRoutes.githubRedirect);
    yaWithBadImg = await getUserAuthData(httpServer, authRoutes.yandexRedirect);
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  describe(`${filesRoutes.create} (POST)`, () => {
    it('should upload image', async () => {
      const imagePath = `${__dirname}/assets/testImg.png`;

      const { status } = await request(httpServer)
        .post(filesRoutes.create(user.id))
        .set('Content-Type', 'multipart/form-data')
        .set('Authorization', user.token)
        .attach('file', imagePath);
      expect(status).toBe(HttpStatus.CREATED);
    });

    it('should upload the image and delete the previous one', async () => {
      const imagePath = `${__dirname}/assets/testImg.png`;

      const { status, body } = await request(httpServer)
        .post(filesRoutes.create(user.id))
        .set('Content-Type', 'multipart/form-data')
        .set('Authorization', user.token)
        .attach('file', imagePath);

      img = body.image;
      expect(status).toBe(HttpStatus.CREATED);
    });

    it('should respond with NOT FOUND status code if image not found', async () => {
      await filesService.removeFile(img);

      const { status } = await request(httpServer).get(filesRoutes.get(user.id)).set('Authorization', user.token);
      expect(status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should upload image after deletion', async () => {
      const imagePath = `${__dirname}/assets/testImg.png`;

      const { status } = await request(httpServer)
        .post(filesRoutes.create(user.id))
        .set('Content-Type', 'multipart/form-data')
        .set('Authorization', user.token)
        .attach('file', imagePath);
      expect(status).toBe(HttpStatus.CREATED);
    });

    it('should respond with FORBIDDEN status code if the user does not have access', async () => {
      const imagePath = `${__dirname}/assets/testImg.png`;

      const { status } = await request(httpServer)
        .post(filesRoutes.create(admin.id))
        .set('Content-Type', 'multipart/form-data')
        .set('Authorization', user.token)
        .attach('file', imagePath);

      expect(status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer)
        .post(filesRoutes.create(user.id))
        .set('Content-Type', 'multipart/form-data');

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with UNPROCESSABLE ENTITY status code if the image is invalid', async () => {
      const imagePath = `${__dirname}/assets/fakeImg.jpg`;

      const { status } = await request(httpServer)
        .post(filesRoutes.create(user.id))
        .set('Content-Type', 'multipart/form-data')
        .set('Authorization', user.token)
        .attach('file', imagePath);

      expect(status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('should respond with UNPROCESSABLE ENTITY status code if the image exceeds the allowed size', async () => {
      const imagePath = `${__dirname}/assets/bigImg.jpg`;

      const { status } = await request(httpServer)
        .post(filesRoutes.create(user.id))
        .set('Content-Type', 'multipart/form-data')
        .set('Authorization', user.token)
        .attach('file', imagePath);

      expect(status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });
  });

  describe(`${filesRoutes.get} (GET)`, () => {
    it('should get image localProvider by user Id', async () => {
      const { status } = await request(httpServer).get(filesRoutes.get(user.id)).set('Authorization', user.token);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should get image GoogleProvider by user Id', async () => {
      const { status } = await request(httpServer).get(filesRoutes.get(admin.id)).set('Authorization', user.token);

      expect(status).toBe(HttpStatus.OK);
    });

    it('should respond with NOT FOUND status code if the image Provider cannot be received', async () => {
      const { status } = await request(httpServer)
        .get(filesRoutes.get(yaWithBadImg.id))
        .set('Authorization', admin.token);

      expect(status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should respond with NOT FOUND status code if the image Provider not valid', async () => {
      const { status } = await request(httpServer)
        .get(filesRoutes.get(githubWithBadImg.id))
        .set('Authorization', admin.token);

      expect(status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should respond with NOT FOUND status code if user not found', async () => {
      const { status } = await request(httpServer)
        .get(filesRoutes.get(mockUsers.localUser.id))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).get(filesRoutes.get(user.id));

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with Bad Request status code if ID is incorrect', async () => {
      const { status } = await request(httpServer).get(filesRoutes.get('test-id')).set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe(`${filesRoutes.delete} (DELETE)`, () => {
    it('should respond with UNAUTHORIZED status code if the user is not authorized', async () => {
      const { status } = await request(httpServer).delete(filesRoutes.delete(user.id));

      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with Bad Request status code if ID is incorrect', async () => {
      const { status } = await request(httpServer)
        .delete(filesRoutes.delete('test-id'))
        .set('Authorization', user.token);

      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should delete image by user Id', async () => {
      const { status } = await request(httpServer).delete(filesRoutes.delete(user.id)).set('Authorization', user.token);

      expect(status).toBe(HttpStatus.NO_CONTENT);
    });

    it('should respond with NOT FOUND status code if image not found (DELETE)', async () => {
      const { status } = await request(httpServer).delete(filesRoutes.delete(user.id)).set('Authorization', user.token);

      expect(status).toBe(HttpStatus.NO_CONTENT);
    });

    it('should respond with NOT FOUND status code if image not found (GET)', async () => {
      const { status } = await request(httpServer).get(filesRoutes.get(user.id)).set('Authorization', user.token);

      expect(status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should respond with NOT FOUND status code if user not found', async () => {
      const { status } = await request(httpServer)
        .delete(filesRoutes.delete(mockUsers.localUser.id))
        .set('Authorization', admin.token);

      expect(status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
