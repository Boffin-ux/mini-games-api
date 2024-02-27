import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { Response, Request } from 'express';
import { FilesController } from '@files/files.controller';
import { FilesService } from '@files/files.service';
import { UsersService } from '@users/users.service';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { mockUsers } from '@test/stubs';
import { configService, filesService, usersService as mockUsersService } from '@test/__mocks__';
import { FILE_TYPES } from '@common/constants';

describe('FilesController unit tests', () => {
  let filesController: FilesController;
  let usersService: Pick<jest.MockedObject<UsersService>, 'getUserById'>;

  const httpService = mockDeep<HttpService>();
  const res = mockDeep<Response>();
  const req = mockDeep<Request>();
  const file = {} as Express.Multer.File;

  const axiosRes = {
    data: FILE_TYPES.jpg,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  } as any as AxiosResponse;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: HttpService,
          useValue: httpService,
        },
      ],
    })
      .useMocker((token) => {
        switch (token) {
          case ConfigService:
            return configService;
          case UsersService:
            return mockUsersService;
          case FilesService:
            return filesService;
          default:
            return null;
        }
      })
      .compile();

    filesController = moduleRef.get<FilesController>(FilesController);
    usersService = moduleRef.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockReset(res);
    mockReset(httpService);
  });

  it('should be defined FilesService', () => {
    expect(filesController).toBeDefined();
  });

  describe('getImage', () => {
    it('should return throw if Image not found', async () => {
      usersService.getUserById.mockResolvedValue(mockUsers.localUser);
      await expect(filesController.getImage(mockUsers.localUser.id, res)).rejects.toThrow();
    });

    it('should return Image User Local', async () => {
      res.sendFile.mockImplementation(() => mockUsers.blockedUser.image);
      usersService.getUserById.mockResolvedValue(mockUsers.blockedUser);
      await expect(filesController.getImage(mockUsers.blockedUser.id, res)).resolves.toEqual(
        mockUsers.blockedUser.image,
      );
    });

    it('should return Not Found if not Image User Local', async () => {
      usersService.getUserById.mockResolvedValue(mockUsers.blockedUser);
      res.sendFile.mockImplementationOnce((_file, _fileName, cb) => cb && cb(new Error()));
      res.sendStatus.mockReturnValue(JSON.parse(JSON.stringify(HttpStatus.NOT_FOUND)));

      await expect(filesController.getImage(mockUsers.blockedUser.id, res)).resolves.toEqual(HttpStatus.NOT_FOUND);
    });

    it('should return Image User Provider', async () => {
      res.send.mockReturnValue(JSON.parse(JSON.stringify(mockUsers.githubProvider.image)));
      httpService.get.mockReturnValue(of(axiosRes));
      usersService.getUserById.mockResolvedValue(mockUsers.githubProvider);

      await expect(filesController.getImage(mockUsers.githubProvider.id, res)).resolves.toEqual(
        mockUsers.githubProvider.image,
      );
    });

    it('should return throw Error for Image User Provider', async () => {
      httpService.get.mockReturnValueOnce(
        throwError(() => {
          throw new NotFoundException();
        }),
      );
      usersService.getUserById.mockResolvedValue(mockUsers.githubProvider);
      await expect(filesController.getImage(mockUsers.githubProvider.id, res)).rejects.toThrow();
    });

    it('should return throw Error if Image User Provider not valid', async () => {
      const axiosResWithErr = { ...axiosRes, data: mockUsers.githubProvider.image };
      httpService.get.mockReturnValue(of(axiosResWithErr));
      usersService.getUserById.mockResolvedValue(mockUsers.githubProvider);
      await expect(filesController.getImage(mockUsers.githubProvider.id, res)).rejects.toThrow();
    });
  });

  describe('uploadImage', () => {
    it('should uploaded Image', async () => {
      await expect(filesController.uploadImage(file, mockUsers.blockedUser.id, req)).resolves.toEqual(
        mockUsers.blockedUser,
      );
    });
  });

  describe('removeImage', () => {
    it('should removed Image', async () => {
      await expect(filesController.removeImage(mockUsers.blockedUser.id)).resolves.toEqual(mockUsers.blockedUser);
    });

    it('should return throw if User not found', async () => {
      mockUsersService.getUserById.mockResolvedValue(null);
      await expect(filesController.removeImage(mockUsers.blockedUser.id)).resolves.toEqual(null);
    });
  });
});
