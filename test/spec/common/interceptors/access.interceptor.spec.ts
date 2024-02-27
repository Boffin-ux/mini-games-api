import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, CallHandler, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { AccessInterceptor } from '@common/interceptors';
import { of } from 'rxjs';
import { UserEntity } from '@users/entities/user.entity';
import { mockUsers } from '@test/stubs';

const mockExecutionContext = mockDeep<ExecutionContext>();
const mockCallHandler = mockDeep<CallHandler>();

describe('AccessInterceptor', () => {
  let accessInterceptor: AccessInterceptor;
  const user = new UserEntity(mockUsers.localUser);
  const admin = new UserEntity(mockUsers.githubProvider);
  const userId = user.id;
  const adminId = admin.id;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [AccessInterceptor],
    }).compile();

    accessInterceptor = moduleRef.get<AccessInterceptor>(AccessInterceptor);

    mockExecutionContext.switchToHttp.mockReturnValue({
      getResponse: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({ user, params: { userId } }),
      getNext: jest.fn(),
    });
  });

  afterEach(() => {
    mockReset(mockCallHandler);
    mockReset(mockExecutionContext);
  });

  it('should be defined', () => {
    expect(accessInterceptor).toBeDefined();
  });

  describe('Access Interceptor', () => {
    it(`should check owner access`, (done) => {
      mockCallHandler.handle.mockReturnValue(of(user));
      accessInterceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((val) => {
        expect(val).toStrictEqual(user);
        done();
      });
    });

    it(`should check admin access`, (done) => {
      mockExecutionContext.switchToHttp.mockReturnValue({
        getResponse: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnValue({ user: admin, params: { userId } }),
        getNext: jest.fn(),
      });

      mockCallHandler.handle.mockReturnValue(of(admin));
      accessInterceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((val) => {
        expect(val).toStrictEqual(admin);
        done();
      });
    });

    it(`should throw ${ForbiddenException.name}`, () => {
      mockExecutionContext.switchToHttp.mockReturnValue({
        getResponse: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnValue({ user, params: { userId: adminId } }),
        getNext: jest.fn(),
      });

      const checkAccess = () => accessInterceptor.intercept(mockExecutionContext, mockCallHandler);
      expect(checkAccess).toThrow(ForbiddenException);
    });

    it(`should throw ${BadRequestException.name}`, () => {
      mockExecutionContext.switchToHttp.mockReturnValue({
        getResponse: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnValue({ user, params: { userId: '123456' } }),
        getNext: jest.fn(),
      });

      const checkAccess = () => accessInterceptor.intercept(mockExecutionContext, mockCallHandler);
      expect(checkAccess).toThrow(BadRequestException);
    });
  });
});
