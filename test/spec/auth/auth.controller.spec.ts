import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '@auth/auth.service';
import { AuthController } from '@auth/auth.controller';
import { Response } from 'express';
import { mockDeep } from 'jest-mock-extended';
import { HttpStatus } from '@nestjs/common';
import { authService, configService, rToken, tokens } from '@test/__mocks__';
import { localDto, mockUsers } from '@test/stubs';

describe('AuthController unit tests', () => {
  let authController: AuthController;
  const res = mockDeep<Response>();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        if (token === AuthService) {
          return authService;
        }
        if (token === ConfigService) {
          return configService;
        }
      })
      .compile();

    authController = moduleRef.get<AuthController>(AuthController);

    res.status.mockReturnThis();
    res.json.mockReturnValue(JSON.parse(JSON.stringify(tokens.accessToken)));
    res.clearCookie.mockReturnThis();
    res.sendStatus.mockReturnValue(JSON.parse(JSON.stringify(HttpStatus.OK)));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined AuthService', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should return generated Tokens', async () => {
      await expect(authController.signIn(localDto.auth, res, mockUsers.localUser, rToken.userAgent)).resolves.toEqual(
        tokens.accessToken,
      );
    });
  });

  describe('signUp', () => {
    it('should sign up a user and return tokens', async () => {
      await expect(authController.signUp(rToken.userAgent, localDto.register)).resolves.toEqual({
        accessToken: tokens.accessToken,
      });
    });
  });

  describe('providerAuth', () => {
    it('should be defined provider google Auth', async () => {
      const googleAuth = jest.spyOn(authController, 'googleAuth');
      authController.googleAuth();
      expect(googleAuth).toHaveBeenCalledTimes(1);
    });

    it('should be defined provider yandex Auth', async () => {
      const yandexAuth = jest.spyOn(authController, 'yandexAuth');
      authController.yandexAuth();
      expect(yandexAuth).toHaveBeenCalledTimes(1);
    });

    it('should be defined provider github Auth', async () => {
      const githubAuth = jest.spyOn(authController, 'githubAuth');
      authController.githubAuth();
      expect(githubAuth).toHaveBeenCalledTimes(1);
    });

    it('should return an AccessToken if Google authenticated', async () => {
      await expect(authController.googleAuthRedirect(mockUsers.localUser, rToken.userAgent, res)).resolves.toEqual(
        tokens.accessToken,
      );
    });

    it('should return an AccessToken if Github authenticated', async () => {
      await expect(authController.githubAuthRedirect(mockUsers.localUser, rToken.userAgent, res)).resolves.toEqual(
        tokens.accessToken,
      );
    });

    it('should return an AccessToken if Yandex authenticated', async () => {
      await expect(authController.yandexAuthRedirect(mockUsers.localUser, rToken.userAgent, res)).resolves.toEqual(
        tokens.accessToken,
      );
    });
  });

  describe('logout', () => {
    it('should not clear user refresh token if not token', async () => {
      await expect(authController.logout(res, null)).resolves.toEqual(HttpStatus.OK);
    });

    it('should clear user refresh token', async () => {
      await expect(authController.logout(res, rToken.token)).resolves.toEqual(HttpStatus.OK);
    });
  });

  describe('RefreshTokens', () => {
    it('should return throw Error if current token not found', async () => {
      await expect(authController.refreshTokens(res, rToken.userAgent, null)).rejects.toThrow();
    });

    it('should return new tokens', async () => {
      await expect(authController.refreshTokens(res, rToken.userAgent, rToken.token)).resolves.toEqual(
        tokens.accessToken,
      );
    });

    it('should return throw Error if tokens not created', async () => {
      authService.refreshTokens.mockResolvedValue(null);
      await expect(authController.refreshTokens(res, rToken.userAgent, rToken.token)).rejects.toThrow();
    });
  });
});
