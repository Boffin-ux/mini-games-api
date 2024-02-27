import { HttpCode, HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';

export const NoContentResponse = (name: string): MethodDecorator => {
  return applyDecorators(
    ApiOperation({ summary: `Delete ${name} by ID` }),
    ApiNoContentResponse({ description: `${name} deleted` }),
    HttpCode(HttpStatus.NO_CONTENT),
  );
};
