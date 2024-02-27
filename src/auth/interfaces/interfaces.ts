import { Token, User, UserRole } from '@prisma/client';

interface Tokens {
  accessToken: string;
  refreshToken: Token;
}

interface JwtRefreshPayload extends JwtPayload {
  refreshToken: string;
}

interface JwtPayload {
  id: string;
  email: string;
  roles: UserRole[];
  iat?: number;
  exp?: number;
}

type UserProvider = Pick<User, 'email' | 'name' | 'image' | 'provider'>;
type RegUser = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isBlocked'>;
type UserPayload = Omit<User, 'createdAt' | 'updatedAt'>;

type CopyWithPartial<T, K extends keyof T> = Omit<T, K> & Partial<T>;
type PartialUser = CopyWithPartial<RegUser, 'roles' | 'password' | 'provider' | 'image'>;

export { Tokens, JwtPayload, JwtRefreshPayload, UserProvider, UserPayload, PartialUser };
