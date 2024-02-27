import { SetMetadata, UseGuards } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { ResponseMessages } from '@common/constants';

export const ROLES_KEY = 'roles';

export function Role(...roles: UserRole[]) {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(RolesGuard),
    ApiForbiddenResponse({ description: ResponseMessages.FORBIDDEN }),
    ApiUnauthorizedResponse({ description: ResponseMessages.UNAUTHORIZED }),
  );
}
