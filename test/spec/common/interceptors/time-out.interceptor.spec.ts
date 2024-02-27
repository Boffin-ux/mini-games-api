import { Test, TestingModule } from '@nestjs/testing';
import { CallHandler, ExecutionContext, RequestTimeoutException } from '@nestjs/common';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { TimeoutInterceptor } from '@common/interceptors';
import { delay, of, throwError } from 'rxjs';

describe('TimeoutInterceptor', () => {
  let timeoutInterceptor: TimeoutInterceptor;
  const mockExecutionContext = mockDeep<ExecutionContext>();
  const mockCallHandler = mockDeep<CallHandler>();

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [TimeoutInterceptor],
    }).compile();

    timeoutInterceptor = moduleRef.get<TimeoutInterceptor>(TimeoutInterceptor);
  });

  afterEach(() => {
    mockReset(mockCallHandler);
  });

  it('should be defined', () => {
    expect(timeoutInterceptor).toBeDefined();
  });

  describe('TimeoutInterceptor', () => {
    it(`should return throw ${RequestTimeoutException.name}`, (done) => {
      mockCallHandler.handle.mockReturnValue(of('test').pipe(delay(5000 + 10)));
      timeoutInterceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(RequestTimeoutException);
          done();
        },
      });
    }, 5100);

    it(`should return throwError`, (done) => {
      mockCallHandler.handle.mockReturnValueOnce(throwError(() => 'An error happened!'));
      timeoutInterceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: (err) => {
          done();
          expect(err).toStrictEqual('An error happened!');
        },
      });
    });
  });
});
