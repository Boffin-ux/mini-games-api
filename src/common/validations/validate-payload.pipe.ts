import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

Injectable();
export class ValidatePayloadExists implements PipeTransform {
  transform(payload: any): any {
    const isEmpty = Object.values(payload).every((value) => value === null || value === '');
    const hasOnlyLevel = Object.values(payload).length === 1 && payload.hasOwnProperty('level');

    if (isEmpty || hasOnlyLevel) {
      throw new BadRequestException('Payload must contain one of the fields (totalTime | score | other)');
    }

    return payload;
  }
}
