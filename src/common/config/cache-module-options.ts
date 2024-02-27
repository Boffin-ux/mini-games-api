import { DEFAULT_ENV } from '@common/constants';
import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const cacheOptions = (): CacheModuleAsyncOptions => ({
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => {
    const ttl = config.get<number>('CACHE_TTL', DEFAULT_ENV.ttlCache);
    return { ttl: Number(ttl) };
  },
  inject: [ConfigService],
});
