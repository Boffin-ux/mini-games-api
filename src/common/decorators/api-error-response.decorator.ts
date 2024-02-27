import { ResponseMessages } from '@common/constants';
import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';

export const ErrorResponse = (name: string): MethodDecorator => {
  return applyDecorators(
    ApiBadRequestResponse({
      description: ResponseMessages.BAD_REQUEST,
    }),
    ApiNotFoundResponse({
      description: `${name} ${ResponseMessages.NOT_FOUND}`,
    }),
  );
};
