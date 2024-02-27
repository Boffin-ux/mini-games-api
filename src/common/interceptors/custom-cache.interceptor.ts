import { ignoreCaching } from '@common/decorators';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Cache } from 'cache-manager';

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: Cache,
    @Inject(Reflector) protected readonly reflector: Reflector,
  ) {
    super(cacheManager, reflector);
  }
  trackBy(ctx: ExecutionContext): string | undefined {
    const request = ctx.switchToHttp().getRequest();

    if (!request) {
      return undefined;
    }
    const { httpAdapter } = this.httpAdapterHost;
    const isNotCaching = ignoreCaching(ctx, this.reflector);

    const isGetRequest = httpAdapter.getRequestMethod(request) === 'GET';

    if (!isGetRequest || (isGetRequest && isNotCaching)) {
      setTimeout(async () => await this.cacheManager.reset(), 0);
      return undefined;
    }

    return httpAdapter.getRequestUrl(request);
  }
}
