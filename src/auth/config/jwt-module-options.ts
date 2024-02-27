import { DEFAULT_ENV } from '@common/constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';

export const jwtOptions = (): JwtModuleAsyncOptions => ({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get('JWT_SECRET_KEY', DEFAULT_ENV.jwtSecret),
    signOptions: {
      expiresIn: await configService.get('EXP_TOKEN', DEFAULT_ENV.tokenExp),
    },
  }),
  inject: [ConfigService],
});
