import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const CACHE_KEY = 'notCaching';
export const NoCache = () => SetMetadata(CACHE_KEY, true);

export const ignoreCaching = (ctx: ExecutionContext, reflector: Reflector) => {
  return reflector.getAllAndOverride(CACHE_KEY, [ctx.getHandler(), ctx.getClass()]);
};
