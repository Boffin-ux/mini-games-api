import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost, Logger } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';
import { PrismaExceptionFilter } from '@common/exceptions';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const DUPLICATE_CODE = 'P2002';
const NOT_FOUND_CODE = 'P2025';
const INVALID_ID_CODE = 'P2023';

const mockLogger = mockDeep<Logger>();
const mockArgumentsHost = mockDeep<ArgumentsHost>();

describe('PrismaExceptionFilter', () => {
  let service: PrismaExceptionFilter;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaExceptionFilter,
        {
          provide: Logger,
          useValue: mockLogger,
        },
        {
          provide: String,
          useValue: 'name',
        },
      ],
    }).compile();

    service = moduleRef.get(PrismaExceptionFilter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Prisma Exceptions', () => {
    it('should return Not Found Exception', () => {
      mockArgumentsHost.switchToHttp.mockImplementation(() => ({
        getResponse: jest.fn().mockReturnValue({
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
        }),
        getRequest: jest.fn().mockReturnValue({
          url: '/some-url',
          method: 'GET',
        }),
        getNext: jest.fn(),
      }));

      service.catch(
        new PrismaClientKnownRequestError('some error', { code: NOT_FOUND_CODE, clientVersion: '1' }),
        mockArgumentsHost,
      );
    });

    it('should return Duplicate Exception', () => {
      mockArgumentsHost.switchToHttp.mockImplementation(() => ({
        getResponse: jest.fn().mockReturnValue({
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
        }),
        getRequest: jest.fn().mockReturnValue({
          url: '/some-url',
          method: 'GET',
        }),
        getNext: jest.fn(),
      }));

      service.catch(
        new PrismaClientKnownRequestError('some error', { code: DUPLICATE_CODE, clientVersion: '1' }),
        mockArgumentsHost,
      );
    });

    it('should return Invalid Exception', () => {
      mockArgumentsHost.switchToHttp.mockImplementation(() => ({
        getResponse: jest.fn().mockReturnValue({
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
        }),
        getRequest: jest.fn().mockReturnValue({
          url: '/some-url',
          method: 'GET',
        }),
        getNext: jest.fn(),
      }));

      service.catch(
        new PrismaClientKnownRequestError('some error', { code: INVALID_ID_CODE, clientVersion: '1' }),
        mockArgumentsHost,
      );
    });

    it('should return Internal Server Error', () => {
      mockArgumentsHost.switchToHttp.mockImplementation(() => ({
        getResponse: jest.fn().mockReturnValue({
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
        }),
        getRequest: jest.fn().mockReturnValue({
          url: '/some-url',
          method: 'GET',
        }),
        getNext: jest.fn(),
      }));

      service.catch(
        new PrismaClientKnownRequestError('some error', { code: '', clientVersion: '1' }),
        mockArgumentsHost,
      );
    });
  });
});
