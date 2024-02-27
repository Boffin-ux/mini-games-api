import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { CustomCacheInterceptor } from '@common/interceptors';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpAdapterHost, Reflector } from '@nestjs/core';

describe('CustomCacheInterceptor', () => {
  let customCacheInterceptor: CustomCacheInterceptor;
  const mockExecutionContext = mockDeep<ExecutionContext>();
  const mockHttpAdapterHost = mockDeep<HttpAdapterHost>();
  const mockReflector = mockDeep<Reflector>();

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CustomCacheInterceptor,
        {
          provide: CACHE_MANAGER,
          useValue: { reset: jest.fn().mockReturnThis() },
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: HttpAdapterHost,
          useValue: mockHttpAdapterHost,
        },
      ],
    }).compile();

    customCacheInterceptor = moduleRef.get(CustomCacheInterceptor);

    mockExecutionContext.switchToHttp.mockReturnValue({
      getResponse: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnThis(),
      getNext: jest.fn(),
    });
  });

  afterEach(() => {
    mockReset(mockExecutionContext);
    mockReset(mockReflector);
    mockReset(mockHttpAdapterHost);
  });

  it('should be defined', () => {
    expect(customCacheInterceptor).toBeDefined();
  });

  describe('Custom Cache Interceptor', () => {
    it('should return undefined and reset cache if Request Method is not "GET"', async () => {
      jest.useFakeTimers();
      customCacheInterceptor.trackBy(mockExecutionContext);
      jest.runAllTimers();
    });

    it('should return undefined if Request Method is "GET"', () => {
      mockReflector.getAllAndOverride.mockReturnValue(null);
      mockHttpAdapterHost.httpAdapter.getRequestMethod.mockReturnValue('GET');

      customCacheInterceptor.trackBy(mockExecutionContext);
    });

    it('should return undefined if not Request', () => {
      mockReflector.getAllAndOverride.mockReturnValue('notCaching');

      mockExecutionContext.switchToHttp.mockReturnValue({
        getResponse: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnValue(null),
        getNext: jest.fn(),
      });

      customCacheInterceptor.trackBy(mockExecutionContext);
    });
  });
});
