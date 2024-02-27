import { LoginDto, RegisterDto } from '@auth/dto';
import { ExecutionContext } from '@nestjs/common';
import { Provider, User, UserRole } from '@prisma/client';
import { PatchUserDto, UpdateUserDto } from '@users/dto';

const userStub = (): User[] => {
  return [
    {
      id: '657c1c1d19a3c59c98b453c8',
      email: 'test-01@mail.com',
      name: 'Test_User-01',
      password: 'password123',
      image: null,
      isBlocked: false,
      provider: Provider.local,
      roles: [UserRole.User],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: '653a0f4d411330d319438246',
      email: 'test-03@mail.com',
      name: 'Test_User-03',
      password: 'password123',
      image: 'http://localhost:5100/files/8862ab28-1bae-484d-ad2e-3de8d194ba8b.jpg',
      isBlocked: true,
      provider: Provider.local,
      roles: [UserRole.User],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: '65645a9394aa697eb600b8f1',
      email: 'test-01@github.com',
      name: 'Test-01_User-Github',
      password: 'password123',
      image: 'https://avatars.githubusercontent.com/u/0',
      isBlocked: false,
      provider: Provider.github,
      roles: [UserRole.Admin],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: '65645a9394aa697eb600b4m4',
      email: 'test-02@github.com',
      name: 'Test-02_User-Github',
      password: 'password123',
      image: 'https://avatars.githubusercontent.com',
      isBlocked: false,
      provider: Provider.github,
      roles: [UserRole.Admin],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: '65645a9394aa697eb600b8w2',
      email: 'test-01@google.com',
      name: 'Test_User-Google',
      password: 'password123',
      image: 'https://avatars.githubusercontent.com/u/0',
      isBlocked: false,
      provider: Provider.google,
      roles: [UserRole.Admin],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: '65645a9394aa697eb600b8h3',
      email: 'test-01@yandex.com',
      name: 'Test-01_User-Yandex',
      password: 'password123',
      image: 'https://avatars.mds.yandex.net/get-yapic/0/0-0/islands-retina-small',
      isBlocked: false,
      provider: Provider.yandex,
      roles: [UserRole.Admin],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: '65645a9394aa697eb600b9iy',
      email: 'test-02@yandex.com',
      name: 'Test-02_User-Yandex',
      password: 'password123',
      image: 'https://avatars.mds.yandex.net/get-yapic/0/0-0/islands-retina-smal',
      isBlocked: false,
      provider: Provider.yandex,
      roles: [UserRole.Admin],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    },
  ];
};

const mockUsers = {
  allUsers: <User[]>userStub(),
  localUser: <User>userStub()[0],
  blockedUser: <User>userStub()[1],
  githubProvider: <User>userStub()[2],
  githubBadImg: <User>userStub()[3],
  googleProvider: <User>userStub()[4],
  yandexProvider: <User>userStub()[5],
  yandexBadImg: <User>userStub()[6],
} as const;

const localDto = {
  register: <RegisterDto>{
    email: mockUsers.localUser.email,
    name: mockUsers.localUser.name,
    password: mockUsers.localUser.password!,
  },
  auth: <LoginDto>{
    email: mockUsers.localUser.email,
    password: mockUsers.localUser.password!,
  },
  update: <UpdateUserDto>{
    name: 'Test_User-07',
    password: 'password1234',
  },
  blocked: <PatchUserDto>{
    isBlocked: true,
  },
  unblocked: <PatchUserDto>{
    isBlocked: false,
  },
} as const;

interface IProviderDto {
  email: string;
  name: string;
  password: string | null;
  image: string | null;
  provider: Provider;
}

interface IProvidersDto {
  [key: string]: IProviderDto;
}

const providerDto: IProvidersDto = {
  github: <IProviderDto>{
    email: mockUsers.githubProvider.email,
    name: mockUsers.githubProvider.name,
    password: mockUsers.githubProvider.password,
    image: mockUsers.githubProvider.image,
    provider: mockUsers.githubProvider.provider,
  },
  githubBadImg: <IProviderDto>{
    email: mockUsers.githubBadImg.email,
    name: mockUsers.githubBadImg.name,
    password: mockUsers.githubBadImg.password,
    image: mockUsers.githubBadImg.image,
    provider: mockUsers.githubBadImg.provider,
  },
  google: <IProviderDto>{
    email: mockUsers.googleProvider.email,
    name: mockUsers.googleProvider.name,
    password: mockUsers.googleProvider.password,
    image: mockUsers.googleProvider.image,
    provider: mockUsers.googleProvider.provider,
  },
  yandex: <IProviderDto>{
    email: mockUsers.yandexProvider.email,
    name: mockUsers.yandexProvider.name,
    password: mockUsers.yandexProvider.password,
    image: mockUsers.yandexProvider.image,
    provider: mockUsers.yandexProvider.provider,
  },
  yandexBadImg: <IProviderDto>{
    email: mockUsers.yandexBadImg.email,
    name: mockUsers.yandexBadImg.name,
    password: mockUsers.yandexBadImg.password,
    image: mockUsers.yandexBadImg.image,
    provider: mockUsers.yandexBadImg.provider,
  },
} as const;

const mockProviderAuthGuard = (dto: IProviderDto) => {
  return {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = dto;
      return true;
    },
  };
};

export { mockUsers, localDto, providerDto, mockProviderAuthGuard };
