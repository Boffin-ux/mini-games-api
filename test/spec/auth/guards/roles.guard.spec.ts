import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { mockUsers } from '@test/stubs';

const mockExecutionContext = mockDeep<ExecutionContext>();
const mockReflector = mockDeep<Reflector>();

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  const user = mockUsers.localUser;
  const admin = mockUsers.githubProvider;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    rolesGuard = moduleRef.get(RolesGuard);

    mockReflector.getAllAndOverride.mockReturnValue(UserRole.Admin);

    mockExecutionContext.switchToHttp.mockReturnValue({
      getResponse: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({ user: admin }),
      getNext: jest.fn(),
    });
  });

  afterEach(() => {
    mockReset(mockExecutionContext);
    mockReset(mockReflector);
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  it('should return true if not required Roles', () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);
    expect(rolesGuard.canActivate(mockExecutionContext)).toBeTruthy();
  });

  it('should return true if required Roles Admin and user has role Admin', () => {
    expect(rolesGuard.canActivate(mockExecutionContext)).toBeTruthy();
  });

  it('should return true if user has role admin', () => {
    mockReflector.getAllAndOverride.mockReturnValue(UserRole.User);
    expect(rolesGuard.canActivate(mockExecutionContext)).toBeTruthy();
  });

  it('should return false if user has not role admin', () => {
    mockExecutionContext.switchToHttp.mockReturnValue({
      getResponse: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({ user }),
      getNext: jest.fn(),
    });

    expect(rolesGuard.canActivate(mockExecutionContext)).toBeFalsy();
  });
});
