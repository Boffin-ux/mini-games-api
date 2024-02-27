import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Profile, Strategy } from 'passport-yandex';
import { Provider } from '@prisma/client';

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('YANDEX_CLIENT_ID', 'YOUR_CLIENT_ID'),
      clientSecret: configService.get('YANDEX_CLIENT_SECRET', 'YOUR_SECRET'),
      callbackURL: configService.get('YANDEX_CALLBACK_URL'),
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { name, emails, photos, provider } = profile;

    if (!name || !emails) {
      throw new UnauthorizedException('Email and username must be filled');
    }

    const user = {
      email: emails[0].value,
      name: name.givenName,
      image: photos ? photos[0].value : null,
      provider: provider || Provider.yandex,
    };

    done(null, user);
  }
}
