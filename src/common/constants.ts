enum ResponseMessages {
  NOT_FOUND = 'Not found',
  BAD_REQUEST = 'Bad Request',
  CONFLICT = 'Already exist',
  UNAUTHORIZED = 'User is not authorized',
  INCORRECT_ID = 'Incorrect ID',
  FORBIDDEN = 'Access Denied',
  SERVER_ERROR = 'Internal error',
  AUTH_ERROR = 'Authorization error',
  VALIDATE_ACCESS = 'Access Denied (only available to owner or administrator)',
}

enum Endpoints {
  AUTH = 'auth',
  USERS = 'users',
  PRODUCTS = 'products',
  STATISTIC = 'stats',
  FILES = 'files',
}

const DEFAULT_ENV = {
  port: 5100,
  uploads: 'uploads',
  tokenExp: '1h',
  rTokenExp: '48h',
  jwtSecret: 'YOUR SECRET KEY',
  ttlCache: 5000,
};

// Validation max size image *KiB
const IMAGE_MAX_SIZE = 100;

// Type ext and Magic number https://en.wikipedia.org/wiki/Magic_number_%28programming%29
const FILE_TYPES = { jpg: 'ffd8ffe0', jpeg: 'ffd8ffe1', png: '89504e47', gif: '47494638' };

export { ResponseMessages, Endpoints, DEFAULT_ENV, FILE_TYPES, IMAGE_MAX_SIZE };
