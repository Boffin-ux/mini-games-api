import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator((key: string, ctx: ExecutionContext) => {
  const { cookies } = ctx.switchToHttp().getRequest();

  return key && key in cookies ? cookies[key] : key ? null : cookies;
});
