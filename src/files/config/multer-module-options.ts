import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModuleAsyncOptions } from '@nestjs/platform-express';
import { mkdir } from 'fs/promises';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_ENV } from '@common/constants';

export const multerOptions = (): MulterModuleAsyncOptions => ({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    storage: diskStorage({
      destination: async (_req, _file, cb) => {
        const uploadPath = configService.get<string>('UPLOAD_LOCATION', DEFAULT_ENV.uploads);
        await mkdir(uploadPath, { recursive: true });

        cb(null, uploadPath);
      },
      filename: (_req, file, cb) => {
        const fileExtension = extname(file.originalname);
        const fileName = `${uuidv4()}${fileExtension}`;

        cb(null, fileName);
      },
    }),
  }),
  inject: [ConfigService],
});
