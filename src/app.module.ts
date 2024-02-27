import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from '@prisma/prisma.module';
import { AuthModule } from '@auth/auth.module';
import { UsersModule } from '@users/users.module';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { ProductsModule } from '@products/products.module';
import { StatisticsModule } from '@statistics/statistics.module';
import { FilesModule } from '@files/files.module';
import { cacheOptions } from '@common/config/cache-module-options';
import { CustomCacheInterceptor } from '@common/interceptors';
import { AllExceptionsFilter } from '@common/exceptions';

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true, isGlobal: true, expandVariables: true }),
    CacheModule.registerAsync(cacheOptions()),
    PrismaModule,
    AuthModule,
    UsersModule,
    FilesModule,
    ProductsModule,
    StatisticsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CustomCacheInterceptor,
    },
  ],
})
export class AppModule {}
