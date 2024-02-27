import { FileValidator } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { extname } from 'path';

interface IImageTypes {
  [name: string]: string;
}

export class ImageTypeValidator extends FileValidator {
  constructor(options: { fileTypes: IImageTypes }) {
    super(options);
  }

  async isValid(file: any) {
    try {
      const fileExtension = extname(file.originalname).slice(1);

      const fileBuffer = await readFile(file.path);
      const bitmap = fileBuffer.toString('hex', 0, 4);

      const type = this.validationOptions.fileTypes[fileExtension];
      return type ? type === bitmap : false;
    } catch {
      return false;
    }
  }

  buildErrorMessage(): string {
    return `Validation failed (expected type is ${Object.keys(this.validationOptions.fileTypes).join('|')})`;
  }
}
