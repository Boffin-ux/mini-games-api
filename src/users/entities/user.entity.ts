import { Exclude } from 'class-transformer';
import { Provider, Stats, Token } from '@prisma/client';

export class UserEntity {
  id: string;
  name: string;
  email: string;
  image: string | null;
  roles: string[];
  isBlocked: boolean;
  statistics: Stats[];
  refreshTokens: Token[];
  updatedAt: Date;

  @Exclude()
  password: string | null;

  @Exclude()
  provider: Provider;

  @Exclude()
  createdAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
