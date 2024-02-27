import { FileValidator } from '@nestjs/common';

export class ImageSizeValidator extends FileValidator {
  private sizeInKib: number;

  constructor(options: { fileSize: number }) {
    super(options);
    this.sizeInKib = this.validationOptions.fileSize * 1024;
  }

  isValid(file: any) {
    return file.size < this.sizeInKib;
  }

  buildErrorMessage(): string {
    return `Validation failed (expected size is less than ${this.validationOptions.fileSize} KiB)`;
  }
}
