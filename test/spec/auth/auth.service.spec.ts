import { Test } from '@nestjs/testing';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt/dist';
import { AuthService } from '@auth/auth.service';
import { UsersService } from '@users/users.service';
import { mockUsers, rTokenStub as rToken, tokensStub as tokens } from '@test/stubs';

describe('AuthService unit tests', () => {
  let authService: AuthService;
  let prisma: DeepMockProxy<PrismaClient>;
  let usersService: Pick<jest.MockedObject<UsersService>, 'getUserById' | 'checkDataProvider'>;
  let jwtService: Pick<jest.MockedObject<JwtService>, 'decode'>;

  const MILLISECONDS = 1000;
  const SECONDS_IN_DAY = 24 * 60 * 60;
  const tokenExp = { exp: Math.floor(Date.now() / MILLISECONDS) + SECONDS_IN_DAY };
  const tokenHasExp = { exp: Math.floor(Date.now() / MILLISECONDS) - SECONDS_IN_DAY };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AuthService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .useMocker((token) => {
        switch (token) {
          case ConfigService:
            return { get: jest.fn().mockReturnValue('JWT_KEY') };
          case UsersService:
            return {
              getUserById: jest.fn(),
              checkDataProvider: jest.fn(),
              createUser: jest.fn().mockResolvedValue(mockUsers.localUser),
            };
          case JwtService:
            return {
              decode: jest.fn(),
              signAsync: jest.fn().mockResolvedValue(tokens.accessToken),
            };
          default:
            return null;
        }
      })
      .compile();

    prisma = moduleRef.get(PrismaService);
    authService = moduleRef.get(AuthService);
    usersService = moduleRef.get(UsersService);
    jwtService = moduleRef.get(JwtService);
  });

  afterEach(() => {
    mockReset(prisma);
    jest.clearAllMocks();
  });

  it('should be defined AuthService', () => {
    expect(authService).toBeDefined();
  });

  it('should define Prisma', () => {
    expect(prisma).toBeDefined();
  });

  describe('generateTokens', () => {
    it('should return generated Tokens', async () => {
      prisma.token.upsert.mockResolvedValueOnce(rToken);
      await expect(authService.generateTokens(mockUsers.localUser, rToken.userAgent)).resolves.toEqual(tokens);
    });
  });

  describe('signUp', () => {
    it('should sign up a user and return tokens', async () => {
      prisma.token.upsert.mockResolvedValueOnce(rToken);
      await expect(authService.signUp(mockUsers.localUser, rToken.userAgent)).resolves.toEqual(tokens);
    });
  });

  describe('getTokenExp', () => {
    it('should return the refresh token expiration date', () => {
      jwtService.decode.mockReturnValue(tokenExp);
      expect(authService.getTokenExp(rToken.token)).toEqual(new Date(tokenExp.exp * MILLISECONDS));
    });
  });

  describe('RefreshTokens', () => {
    it('should return null if current token not found', async () => {
      prisma.token.findUnique.mockResolvedValueOnce(null);
      await expect(authService.refreshTokens(rToken.token, rToken.userAgent)).resolves.toEqual(null);
    });

    it('should return null if user not found', async () => {
      usersService.getUserById.mockResolvedValueOnce(null);
      await expect(authService.refreshTokens(rToken.token, rToken.userAgent)).resolves.toEqual(null);
    });

    it('should return new tokens', async () => {
      prisma.token.findUnique.mockResolvedValueOnce(rToken);
      prisma.token.delete.mockResolvedValueOnce(rToken);
      usersService.getUserById.mockResolvedValueOnce(mockUsers.localUser);
      jwtService.decode.mockReturnValue(tokenExp);
      prisma.token.upsert.mockResolvedValueOnce(rToken);

      await expect(authService.refreshTokens(rToken.token, rToken.userAgent)).resolves.toEqual(tokens);
    });

    it('should return null if token expired', async () => {
      prisma.token.findUnique.mockResolvedValueOnce(rToken);
      prisma.token.delete.mockResolvedValueOnce(rToken);
      usersService.getUserById.mockResolvedValueOnce(mockUsers.localUser);
      jwtService.decode.mockReturnValue(tokenHasExp);

      await expect(authService.refreshTokens(rToken.token, rToken.userAgent)).resolves.toEqual(null);
    });
  });

  describe('providerAuth', () => {
    it('should return tokens if user exist', async () => {
      usersService.checkDataProvider.mockResolvedValueOnce(mockUsers.localUser);
      prisma.token.upsert.mockResolvedValueOnce(rToken);
      await expect(authService.providerAuth(mockUsers.localUser, rToken.userAgent)).resolves.toEqual(tokens);
    });

    it('should sign up a user and return tokens if user exist', async () => {
      const admin = { ...mockUsers.localUser, roles: mockUsers.githubProvider.roles };
      usersService.checkDataProvider.mockResolvedValueOnce(null);
      prisma.user.create.mockResolvedValueOnce(admin);
      prisma.token.upsert.mockResolvedValueOnce(rToken);
      await expect(authService.providerAuth(admin, rToken.userAgent)).resolves.toEqual(tokens);
    });
  });

  describe('logout', () => {
    it('should clear user refresh tokens', async () => {
      prisma.token.delete.mockResolvedValueOnce(rToken);
      await expect(authService.logout(rToken.token)).resolves.toEqual(rToken);
    });
  });
});
