import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { App } from 'supertest/types';
import { CanActivate, HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@prisma/prisma.service';
import * as cookieParser from 'cookie-parser';
import { ConfigModule } from '@nestjs/config';
import { authRoutes } from './endpoints';
import { GoogleAuthGuard } from '@auth/guards/google-auth.guard';
import { GithubAuthGuard } from '@auth/guards/github-auth.guard';
import { YandexAuthGuard } from '@auth/guards/yandex-auth.guard';
import { localDto, mockUsers, providerDto, mockProviderAuthGuard } from '@test/stubs';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: App;
  let cookies: string;

  const fakeCookie = ['jwt-refresh="test"'];

  const mockGithubAuthGuard: CanActivate = mockProviderAuthGuard(providerDto.github);
  const mockGoogleAuthGuard: CanActivate = mockProviderAuthGuard(providerDto.google);
  const mockYandexAuthGuard: CanActivate = mockProviderAuthGuard(providerDto.yandex);

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
    prisma = app.get<PrismaService>(PrismaService);
    httpServer = app.getHttpServer();

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, always: true, transform: true }),
    );
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  describe(`'/favicon.ico' (GET)`, () => {
    it('should respond with OK status code if url has favicon.ico', async () => {
      const { status } = await request(httpServer).get('/favicon.ico');

      expect(status).toBe(HttpStatus.OK);
    });
  });

  describe(`${authRoutes.signup} (POST)`, () => {
    it('should sign up a user and return accessToken', async () => {
      const { status, body } = await request(httpServer).post(authRoutes.signup).send(localDto.register);

      expect(status).toBe(HttpStatus.CREATED);
      expect(body.accessToken).toBeDefined();
    });

    it('should respond with PrismaClientKnownRequestError status code if Email already exist', async () => {
      const { status } = await request(httpServer).post(authRoutes.signup).send(localDto.register);
      expect(status).toBe(HttpStatus.CONFLICT);
    });

    it('should respond with Bad Request status code if Email format isn`t correct', async () => {
      const { status } = await request(httpServer)
        .post(authRoutes.signup)
        .send({ ...localDto.register, email: 'test' });
      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Bad Request status code if Password length less is less than 6', async () => {
      const { status } = await request(httpServer)
        .post(authRoutes.signup)
        .send({ ...localDto.register, password: 'test' });
      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Bad Request status code if field "Name" is not passed', async () => {
      const { status } = await request(httpServer).post(authRoutes.signup).send({ email: mockUsers.localUser.email });
      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Bad Request status code if field "Email" is not passed', async () => {
      const { status } = await request(httpServer).post(authRoutes.signup).send({ name: mockUsers.localUser.name });
      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Bad Request status code if not payload', async () => {
      const { status } = await request(httpServer).post(authRoutes.signup).send({});
      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe(`${authRoutes.login} (POST)`, () => {
    it('should login as user and return accessToken', async () => {
      const { status, body, headers } = await request(httpServer).post(authRoutes.login).send(localDto.auth);

      cookies = headers['set-cookie'];

      expect(status).toBe(HttpStatus.CREATED);
      expect(body.accessToken).toBeDefined();
    });

    it('should respond with Bad Request status code if not payload', async () => {
      const { status } = await request(httpServer).post(authRoutes.login).send({});
      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Bad Request status code if field "Email" is not passed', async () => {
      const { status } = await request(httpServer).post(authRoutes.login).send({ password: 'test' });
      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with Unauthorized status code if "Password" is not valid', async () => {
      const { status } = await request(httpServer)
        .post(authRoutes.login)
        .send({ ...localDto.auth, password: 'testPassword' });
      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should respond with Unauthorized status code if "Email" not found', async () => {
      const { status } = await request(httpServer)
        .post(authRoutes.login)
        .send({ ...localDto.auth, email: 'test@test.test' });
      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${authRoutes.logout} (GET)`, () => {
    it('should return OK status code if the cookie has a refresh token', async () => {
      const { status } = await request(httpServer).get(authRoutes.logout).set('Cookie', cookies);
      expect(status).toBe(HttpStatus.OK);
    });

    it('should return Not Found status code if cookie contains a refresh token not found', async () => {
      const { status } = await request(httpServer).get(authRoutes.logout).set('Cookie', fakeCookie);
      expect(status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return OK status code if there is no cookie', async () => {
      const { status } = await request(httpServer).get(authRoutes.logout);
      expect(status).toBe(HttpStatus.OK);
    });
  });

  describe(`${authRoutes.refresh} (GET)`, () => {
    it('should return UNAUTHORIZED status code if the cookie does not have a valid refresh token', async () => {
      const { status } = await request(httpServer).get(authRoutes.refresh).set('Cookie', fakeCookie);
      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should return CREATED status code if the cookie has a refresh token', async () => {
      const { headers } = await request(httpServer).post(authRoutes.login).send(localDto.auth);
      cookies = headers['set-cookie'];

      const {
        body: { accessToken },
        status,
      } = await request(httpServer).get(authRoutes.refresh).set('Cookie', cookies).send();
      expect(status).toBe(HttpStatus.CREATED);
      expect(accessToken).toBeDefined();
    });

    it('should return UNAUTHORIZED status code if there is no cookie', async () => {
      const { status } = await request(httpServer).get(authRoutes.refresh).send();
      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${authRoutes.github} (GET)`, () => {
    it('should return CREATED status code if the cookie does not have a valid refresh token', async () => {
      const { status } = await request(httpServer).get(authRoutes.github);
      expect(status).toBe(HttpStatus.OK);
    });
  });

  describe(`${authRoutes.githubRedirect} (GET)`, () => {
    it('should return CREATED status code and return accessToken', async () => {
      const { status, body } = await request(httpServer).get(authRoutes.githubRedirect);
      expect(status).toEqual(HttpStatus.CREATED);
      expect(body.accessToken).toBeDefined();
    });

    it('should return accessToken if user exists', async () => {
      const { status, body } = await request(httpServer).get(authRoutes.githubRedirect);
      expect(status).toEqual(HttpStatus.CREATED);
      expect(body.accessToken).toBeDefined();
    });

    it('should return UNAUTHORIZED status code if request without user', async () => {
      mockGithubAuthGuard.canActivate = () => true;
      const { status } = await request(httpServer).get(authRoutes.githubRedirect);
      expect(status).toEqual(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${authRoutes.google} (GET)`, () => {
    it('should return CREATED status code if the cookie does not have a valid refresh token', async () => {
      const { status } = await request(httpServer).get(authRoutes.google);
      expect(status).toBe(HttpStatus.OK);
    });
  });

  describe(`${authRoutes.googleRedirect} (GET)`, () => {
    it('should return CREATED status code and return accessToken', async () => {
      const { status, body } = await request(httpServer).get(authRoutes.googleRedirect);
      expect(status).toEqual(HttpStatus.CREATED);
      expect(body.accessToken).toBeDefined();
    });

    it('should return UNAUTHORIZED status code if request without user', async () => {
      mockGoogleAuthGuard.canActivate = () => true;
      const { status } = await request(httpServer).get(authRoutes.googleRedirect);
      expect(status).toEqual(HttpStatus.UNAUTHORIZED);
    });
  });

  describe(`${authRoutes.yandex} (GET)`, () => {
    it('should return CREATED status code if the cookie does not have a valid refresh token', async () => {
      const { status } = await request(httpServer).get(authRoutes.yandex);
      expect(status).toBe(HttpStatus.OK);
    });
  });

  describe(`${authRoutes.yandexRedirect} (GET)`, () => {
    it('should return CREATED status code and return accessToken', async () => {
      const { status, body } = await request(httpServer).get(authRoutes.yandexRedirect);
      expect(status).toEqual(HttpStatus.CREATED);
      expect(body.accessToken).toBeDefined();
    });

    it('should return UNAUTHORIZED status code if request without user', async () => {
      mockYandexAuthGuard.canActivate = () => true;
      const { status } = await request(httpServer).get(authRoutes.yandexRedirect);
      expect(status).toEqual(HttpStatus.UNAUTHORIZED);
    });
  });
});
