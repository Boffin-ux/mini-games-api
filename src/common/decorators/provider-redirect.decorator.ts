import { UseGuards, UseInterceptors } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { TimeoutInterceptor } from '@common/interceptors';
import { GoogleAuthGuard } from '@auth/guards/google-auth.guard';
import { YandexAuthGuard } from '@auth/guards/yandex-auth.guard';
import { GithubAuthGuard } from '@auth/guards/github-auth.guard';

type ProviderGuard = typeof GoogleAuthGuard | YandexAuthGuard | GithubAuthGuard;

export function ProviderRedirect(guard: ProviderGuard) {
  return applyDecorators(UseGuards(guard), ApiExcludeEndpoint(), UseInterceptors(new TimeoutInterceptor()));
}
