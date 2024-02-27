import * as request from 'supertest';
import { App } from 'supertest/types';
import { decode } from 'jsonwebtoken';
import { JwtPayload } from '@auth/interfaces/interfaces';
import { LoginDto, RegisterDto } from '@auth/dto';

interface UserAuthData {
  id: string;
  token: string;
}
type LocalAuthDto = RegisterDto | LoginDto;

const getUserAuthData = async (httpServer: App, route: string, dto?: LocalAuthDto) => {
  const errMsg = 'Authorization is not implemented';
  const {
    body: { accessToken },
  } = dto ? await request(httpServer).post(route).send(dto) : await request(httpServer).get(route);

  if (!accessToken) {
    if (dto) {
      throw new Error(`Local ${errMsg}`);
    }
    throw new Error(`Provider ${errMsg}`);
  }

  const { id } = decode(accessToken) as JwtPayload;

  return { id, token: `Bearer ${accessToken}` };
};

export { UserAuthData, getUserAuthData };
