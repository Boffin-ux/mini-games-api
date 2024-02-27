import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { GoogleAuthGuard } from './google-auth.guard';
import { YandexAuthGuard } from './yandex-auth.guard';
import { GithubAuthGuard } from './github-auth.guard';

export const GUARDS = [LocalAuthGuard, JwtAuthGuard, RolesGuard, GoogleAuthGuard, YandexAuthGuard, GithubAuthGuard];
