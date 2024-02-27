import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileUploadDto } from '../dto/file-upload.dto';

export const ApiFile = (): MethodDecorator => {
  return applyDecorators(
    UseInterceptors(FileInterceptor('file')),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      type: FileUploadDto,
    }),
  );
};
