import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { multerOptions } from './config/multer-module-options';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { UsersModule } from '@users/users.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [FilesController],
  imports: [UsersModule, MulterModule.registerAsync(multerOptions()), HttpModule],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
