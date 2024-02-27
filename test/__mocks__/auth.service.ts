import { rTokenStub as rToken, tokensStub as tokens } from '@test/stubs';

const authService = {
  refreshTokens: jest.fn().mockResolvedValue(tokens),
  generateTokens: jest.fn().mockResolvedValue(tokens),
  signUp: jest.fn().mockResolvedValue(tokens),
  providerAuth: jest.fn().mockResolvedValue(tokens),
  getTokenExp: jest.fn().mockReturnValue(new Date()),
  logout: jest.fn().mockResolvedValue(rToken),
};

export { tokens, rToken, authService };
