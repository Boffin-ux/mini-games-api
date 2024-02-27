import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { basename, resolve } from 'path';
import { rm } from 'fs/promises';
import { DEFAULT_ENV } from '@common/constants';

@Injectable()
export class FilesService {
  private path: string;

  constructor(private readonly configService: ConfigService) {
    this.path = configService.get('UPLOAD_LOCATION', DEFAULT_ENV.uploads);
  }

  async removeFile(imageUrl: string) {
    const avatar = basename(imageUrl);
    const pathToImage = resolve(this.path, avatar);

    return await rm(pathToImage, { recursive: true }).catch(() => null);
  }
}
