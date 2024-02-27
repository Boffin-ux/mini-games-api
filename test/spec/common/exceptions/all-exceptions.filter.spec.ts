import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from '@common/exceptions';
import { ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { ResponseMessages } from '@common/constants';
import { FilesService } from '@files/files.service';
import { filesService } from '@test/__mocks__';

const mockLogger = mockDeep<Logger>();
const mockHttpAdapterHost = mockDeep<HttpAdapterHost>();
const mockArgumentsHost = mockDeep<ArgumentsHost>();

describe('AllExceptionsFilter', () => {
  let service: AllExceptionsFilter<any>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AllExceptionsFilter,
        {
          provide: Logger,
          useValue: mockLogger,
        },
        {
          provide: HttpAdapterHost,
          useValue: mockHttpAdapterHost,
        },
      ],
    })
      .useMocker((token) => {
        if (token === FilesService) {
          return filesService;
        }
      })
      .compile();

    service = moduleRef.get(AllExceptionsFilter);
  });

  afterEach(() => {
    mockReset(mockArgumentsHost);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Http exceptions', () => {
    it('should return Http exception', () => {
      mockArgumentsHost.switchToHttp.mockImplementation(() => ({
        getResponse: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnValue({
          url: '/some-url',
          method: 'GET',
        }),
        getNext: jest.fn(),
      }));

      service.catch(
        new HttpException({ message: ResponseMessages.BAD_REQUEST }, HttpStatus.BAD_REQUEST),
        mockArgumentsHost,
      );
    });

    it('should not return exception', () => {
      mockArgumentsHost.switchToHttp.mockImplementation(() => ({
        getResponse: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnThis(),
        getNext: jest.fn(),
      }));

      service.catch(null, mockArgumentsHost);
    });

    it('should return Unprocessable Entity exception and remove file', () => {
      mockArgumentsHost.switchToHttp.mockImplementation(() => ({
        getResponse: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnValue({
          url: '/some-url',
          method: 'GET',
          file: 'test.png',
        }),
        getNext: jest.fn(),
      }));

      service.catch(
        new HttpException({ message: 'Validation failed' }, HttpStatus.UNPROCESSABLE_ENTITY),
        mockArgumentsHost,
      );
    });

    it('should respond with OK status code if url has "/favicon.ico"', () => {
      mockArgumentsHost.switchToHttp.mockImplementation(() => ({
        getResponse: jest.fn().mockReturnValue({
          writeHead: jest.fn().mockReturnValue(200),
          end: jest.fn(),
        }),
        getRequest: jest.fn().mockReturnValue({
          url: '/favicon.ico',
          method: 'GET',
        }),
        getNext: jest.fn(),
      }));
      service.catch(null, mockArgumentsHost);
    });
  });
});
