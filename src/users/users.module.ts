import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { FilesService } from '@files/files.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, FilesService],
  exports: [UsersService],
})
export class UsersModule {}
