import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';
import { UsersService } from '@users/users.service';
import { usersService } from '@test/__mocks__';
import { LocalAuthGuard } from '@auth/guards/local-auth.guard';
import { LocalStrategy } from '@auth/strategies/local.strategy';
import { localDto, mockUsers } from '@test/stubs';

describe('LocalAuthGuard', () => {
  let localAuthGuard: LocalAuthGuard;
  const mockExecutionContext = mockDeep<ExecutionContext>();
  const mockDto = {
    body: localDto.auth,
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [LocalStrategy, LocalAuthGuard],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return usersService;
        }
      })
      .compile();

    localAuthGuard = moduleRef.get(LocalAuthGuard);

    mockExecutionContext.switchToHttp.mockReturnValue({
      getResponse: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockDto),
      getNext: jest.fn(),
    });
  });

  it('should be defined', () => {
    expect(localAuthGuard).toBeDefined();
  });

  it('should return true if auth', () => {
    expect(localAuthGuard.canActivate(mockExecutionContext)).toBeTruthy();
  });

  it('should return throw UnauthorizedException if user not valid', async () => {
    usersService.validateUser.mockResolvedValue(null);
    await expect(localAuthGuard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should return throw BadRequestException if DTO not valid', async () => {
    const loginDto = { body: { password: mockUsers.localUser.password } };

    mockExecutionContext.switchToHttp.mockReturnValue({
      getResponse: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(loginDto),
      getNext: jest.fn(),
    });
    await expect(localAuthGuard.canActivate(mockExecutionContext)).rejects.toThrow(BadRequestException);
  });
});
