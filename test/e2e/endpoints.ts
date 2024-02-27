const authRoutes = {
  google: '/auth/google',
  googleRedirect: '/auth/google/redirect',
  yandex: '/auth/yandex',
  yandexRedirect: '/auth/yandex/redirect',
  github: '/auth/github',
  githubRedirect: '/auth/github/redirect',
  signup: '/auth/register',
  login: '/auth/login',
  refresh: '/auth/refresh-tokens',
  logout: '/auth/logout',
} as const;

const usersRoutes = {
  getAll: '/users',
  getUser: (userId: string) => `/users/${userId}`,
  update: (userId: string) => `/users/${userId}`,
  patch: (userId: string) => `/users/${userId}`,
  remove: (userId: string) => `/users/${userId}`,
} as const;

const productsRoutes = {
  create: '/products',
  getAll: '/products',
  getProduct: (productId: string) => `/products/${productId}`,
  update: (productId: string) => `/products/${productId}`,
  delete: (productId: string) => `/products/${productId}`,
} as const;

const statsRoutes = {
  create: (productId: string) => `/stats/products/${productId}`,
  getAll: '/stats',
  getStatistics: (statsId: string) => `/stats/${statsId}`,
  statsByProduct: (productId: string) => `/stats/products/${productId}`,
  productStatsByField: (productId: string) => `/stats/products/${productId}/sortByField`,
  productStatsByFields: (productId: string) => `/stats/products/${productId}/sortByFields`,
  userStatsByProduct: (productId: string, userId: string) => `/stats/products/${productId}/users/${userId}`,
  statsByUser: (userId: string) => `/stats/users/${userId}`,
  userStatsByField: (userId: string) => `/stats/users/${userId}/sortByField`,
  userStatsByFields: (userId: string) => `/stats/users/${userId}/sortByFields`,
  delete: (statsId: string, userId: string) => `/stats/${statsId}/users/${userId}`,
} as const;

const filesRoutes = {
  create: (userId: string) => `/files/upload/${userId}`,
  get: (userId: string) => `/files/${userId}`,
  delete: (userId: string) => `/files/${userId}`,
} as const;

export { authRoutes, usersRoutes, productsRoutes, statsRoutes, filesRoutes };
