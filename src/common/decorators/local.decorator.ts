import { UseGuards } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LocalAuthGuard } from '@auth/guards/local-auth.guard';
import { ResponseMessages } from '@common/constants';

export function Local() {
  return applyDecorators(
    UseGuards(LocalAuthGuard),
    ApiUnauthorizedResponse({ description: ResponseMessages.AUTH_ERROR }),
    ApiBadRequestResponse({ description: ResponseMessages.BAD_REQUEST }),
  );
}
