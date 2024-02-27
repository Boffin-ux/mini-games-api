import { HttpStatus, ParseFilePipe, UploadedFile } from '@nestjs/common';
import { ImageSizeValidator, ImageTypeValidator } from '../validations';
import { FILE_TYPES, IMAGE_MAX_SIZE } from '@common/constants';

export function CustomUploadedFile() {
  return UploadedFile(
    new ParseFilePipe({
      validators: [
        new ImageSizeValidator({ fileSize: IMAGE_MAX_SIZE }),
        new ImageTypeValidator({ fileTypes: FILE_TYPES }),
      ],
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );
}
