import * as request from 'supertest';
import { App } from 'supertest/types';
import { usersRoutes } from '../endpoints';

const removeUserAndToken = async (httpServer: App, id: string, token: string) => {
  await request(httpServer).delete(usersRoutes.remove(id)).set('Authorization', token);
};

export { removeUserAndToken };
