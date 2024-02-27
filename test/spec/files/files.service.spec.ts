import { Test } from '@nestjs/testing';
import * as fs from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { FilesService } from '@files/files.service';
import { mockUsers } from '@test/stubs';

describe('FilesService unit tests', () => {
  let filesService: FilesService;
  const mockFS: jest.Mocked<typeof fs> = <jest.Mocked<typeof fs>>fs;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [FilesService],
    })
      .useMocker((token) => {
        if (token === ConfigService) {
          return { get: jest.fn().mockReturnValue('uploads') };
        }
      })
      .compile();

    filesService = moduleRef.get<FilesService>(FilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined FilesService', () => {
    expect(filesService).toBeDefined();
  });

  describe('removeFile', () => {
    it('should delete file', async () => {
      mockFS.rm = jest.fn().mockResolvedValueOnce(Promise.resolve());
      await expect(filesService.removeFile(mockUsers.blockedUser.image!)).resolves.not.toBeNull();
      expect(mockFS.rm).toHaveBeenCalledTimes(1);
    });

    it('should return null', async () => {
      mockFS.rm = jest.fn().mockRejectedValueOnce(null);
      await expect(filesService.removeFile(mockUsers.blockedUser.image!)).resolves.toBeNull();
    });
  });
});
