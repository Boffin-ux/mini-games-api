import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Profile, Strategy } from 'passport-github2';
import { Provider } from '@prisma/client';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID', 'YOUR_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_CLIENT_SECRET', 'YOUR_SECRET'),
      callbackURL: configService.get('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ) {
    const { username, emails, photos, provider } = profile;

    if (!username || !emails) {
      throw new UnauthorizedException('Email and username must be filled');
    }

    const user = {
      email: emails[0].value,
      name: username,
      image: photos ? photos[0].value : null,
      provider: provider || Provider.github,
    };
    done(null, user);
  }
}
