import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserPayload } from '@auth/interfaces/interfaces';

export const CurrentUser = createParamDecorator(
  (key: keyof UserPayload, ctx: ExecutionContext): UserPayload | Partial<UserPayload> => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return key && key in user ? user[key] : user;
  },
);
