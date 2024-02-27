import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { YandexStrategy } from './yandex.strategy';
import { GitHubStrategy } from './github.strategy';

export const STRATEGIES = [JwtStrategy, LocalStrategy, GoogleStrategy, YandexStrategy, GitHubStrategy];
