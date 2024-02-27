import { ResponseMessages } from '@common/constants';
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ValidateId implements PipeTransform<string> {
  transform(value: string) {
    if (ObjectId.isValid(value)) {
      return value;
    }
    throw new BadRequestException(ResponseMessages.INCORRECT_ID);
  }
}
