import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { JwtStrategy } from '@auth/strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@users/users.service';
import { rTokenStub as rToken } from '@test/stubs';
import { configService, usersService } from '@test/__mocks__';

const mockExecutionContext = mockDeep<ExecutionContext>();
const mockReflector = mockDeep<Reflector>();
const mockLogger = mockDeep<Logger>();

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: Logger,
          useValue: mockLogger,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        JwtStrategy,
        JwtAuthGuard,
      ],
    })
      .useMocker((token) => {
        if (token === ConfigService) {
          return configService;
        }
        if (token === UsersService) {
          return usersService;
        }
      })
      .compile();

    jwtAuthGuard = moduleRef.get(JwtAuthGuard);

    mockReflector.getAllAndOverride.mockReturnValue(null);

    mockExecutionContext.switchToHttp.mockReturnValue({
      getResponse: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({
        headers: {
          authorization: `Bearer ${rToken.token}`,
        },
      }),
      getNext: jest.fn(),
    });
  });

  afterEach(() => {
    mockReset(mockExecutionContext);
    mockReset(mockReflector);
  });

  it('should be defined', () => {
    expect(jwtAuthGuard).toBeDefined();
  });

  describe('True', () => {
    it('should return true if auth', () => {
      expect(jwtAuthGuard.canActivate(mockExecutionContext)).toBeTruthy();
    });

    it('should return true if has Public key', () => {
      mockReflector.getAllAndOverride.mockReturnValue(true);
      expect(jwtAuthGuard.canActivate(mockExecutionContext)).toBeTruthy();
    });
  });

  describe('False', () => {
    it('should return throw UnauthorizedException if an error occurred', async () => {
      usersService.getUserById.mockRejectedValue(UnauthorizedException);
      await expect(jwtAuthGuard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should return throw UnauthorizedException if the user is not found', async () => {
      usersService.getUserById.mockResolvedValue(null);
      await expect(jwtAuthGuard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should return throw UnauthorizedException if jwt token not valid', async () => {
      mockExecutionContext.switchToHttp.mockReturnValue({
        getResponse: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: '',
          },
        }),
        getNext: jest.fn(),
      });

      await expect(jwtAuthGuard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
    });
  });
});
