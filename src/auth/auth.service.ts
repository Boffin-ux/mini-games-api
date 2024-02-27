import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist';
import { UsersService } from '@users/users.service';
import { PrismaService } from '@prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { PartialUser, Tokens, UserPayload, UserProvider } from './interfaces/interfaces';
import { DEFAULT_ENV } from '@common/constants';

const MILLISECONDS = 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens({ id, email, roles }: UserPayload, agent: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ id, email, roles }),
      this.getRefreshToken(id, agent),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async getRefreshToken(userId: string, userAgent: string) {
    const rToken = await this.jwtService.signAsync(
      { id: userId },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET_KEY', DEFAULT_ENV.jwtSecret),
        expiresIn: this.configService.get('EXP_REFRESH_TOKEN', DEFAULT_ENV.rTokenExp),
      },
    );

    const getToken = await this.prisma.token.findFirst({
      where: { userId, userAgent },
    });
    const token = getToken?.token || '';

    return await this.prisma.token.upsert({
      where: { token },
      update: {
        token: rToken,
        userId,
      },
      create: {
        token: rToken,
        userId,
        userAgent,
      },
    });
  }

  getTokenExp(token: string) {
    const { exp } = this.jwtService.decode(token) as { exp: number };
    return new Date(exp * MILLISECONDS);
  }

  async refreshTokens(refreshToken: string, agent: string) {
    const currentRToken = await this.prisma.token.findUnique({
      where: { token: refreshToken },
    });

    if (!currentRToken) {
      return null;
    }

    await this.prisma.token.delete({ where: { token: refreshToken } });
    const user = await this.usersService.getUserById(currentRToken.userId);
    const isTokenExpired = this.getTokenExp(currentRToken.token) < new Date();

    return isTokenExpired || !user ? null : await this.generateTokens(user, agent);
  }

  async signUp(authDto: PartialUser, agent: string) {
    const newUser = await this.usersService.createUser(authDto);
    return await this.generateTokens(newUser, agent);
  }

  async providerAuth(authData: UserProvider, agent: string) {
    const userExist = await this.usersService.checkDataProvider(authData);

    if (userExist) {
      return await this.generateTokens(userExist, agent);
    }

    return await this.signUp({ roles: [UserRole.Admin], ...authData }, agent);
  }

  async logout(token: string) {
    return await this.prisma.token.delete({ where: { token } });
  }
}
