import { ResponseMessages } from '@common/constants';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ObjectId } from 'mongodb';
import { UserRole } from '@prisma/client';

@Injectable()
export class AccessInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    const {
      user: { id, roles },
      params: { userId },
    } = req;

    if (id && userId) {
      if (!ObjectId.isValid(userId)) {
        throw new BadRequestException(ResponseMessages.INCORRECT_ID);
      }

      const isAdmin = roles.includes(UserRole.Admin);
      const isOwner = id === userId && !isAdmin;
      const hasAccess = isOwner || isAdmin;

      if (!hasAccess) {
        throw new ForbiddenException(ResponseMessages.VALIDATE_ACCESS);
      }
    }

    return next.handle();
  }
}
