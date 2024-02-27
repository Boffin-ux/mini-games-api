import { Test, TestingModule } from '@nestjs/testing';
import { CallHandler, ExecutionContext, NotFoundException } from '@nestjs/common';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { NotFoundInterceptor } from '@common/interceptors';
import { of } from 'rxjs';

describe('NotFoundInterceptor', () => {
  let notFoundInterceptor: NotFoundInterceptor;
  const mockExecutionContext = mockDeep<ExecutionContext>();
  const mockCallHandler = mockDeep<CallHandler>();

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        NotFoundInterceptor,
        {
          provide: String,
          useValue: 'Name',
        },
      ],
    }).compile();

    notFoundInterceptor = moduleRef.get<NotFoundInterceptor>(NotFoundInterceptor);
  });

  afterEach(() => {
    mockReset(mockCallHandler);
  });

  it('should be defined', () => {
    expect(notFoundInterceptor).toBeDefined();
  });

  describe('NotFound Interceptor', () => {
    it('should return data', (done) => {
      const data = 'test';
      mockCallHandler.handle.mockReturnValue(of(data));
      notFoundInterceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((val) => {
        expect(val).toStrictEqual(data);
        done();
      });
    });

    it(`should throw ${NotFoundException.name}`, (done) => {
      mockCallHandler.handle.mockReturnValue(of(null));
      notFoundInterceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          done();
        },
      });
    });
  });
});
