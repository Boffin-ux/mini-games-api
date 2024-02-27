import { Tokens } from '@auth/interfaces/interfaces';
import { Token } from '@prisma/client';
import { mockUsers } from '.';

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBhMzVjZDYyLWUwOWYtNDQ1Zi1iMzIxLWY0ZTdjNzIzNGY3MiIsImVtYWlsIjoidGVzdC0wMUBtYWlsLmNvbSIsInJvbGVzIjpbIlVzZXIiXSwiaWF0IjoxNzAzMDY4NTkxLCJleHAiOjI1MDUwNjgxOTF9.ZJuL1jhQxrIhsPxoicXpNwnMdOCqhIxydCvxJ56aYho';

const rTokenStub: Token = {
  id: '6569cc51b79100349727aaee',
  token,
  userAgent: 'iTunes/9.1.1',
  userId: mockUsers.localUser.id,
} as const;

const tokensStub: Tokens = {
  accessToken: token,
  refreshToken: rTokenStub,
} as const;

export { rTokenStub, tokensStub };
