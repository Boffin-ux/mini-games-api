import { Test } from '@nestjs/testing';
import { mockReset, DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { UsersService } from '@users/users.service';
import { hash } from 'bcryptjs';
import { mockUsers } from '@test/stubs';

describe('UsersService unit tests', () => {
  let usersService: UsersService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    prisma = moduleRef.get(PrismaService);
    usersService = moduleRef.get<UsersService>(UsersService);
  });

  afterEach(() => {
    mockReset(prisma);
  });

  it('should be defined UsersService', () => {
    expect(usersService).toBeDefined();
  });

  it('should define Prisma', () => {
    expect(prisma).toBeDefined();
  });

  describe('createUser', () => {
    it('should return new user without password', async () => {
      const userDto = { ...mockUsers.localUser, password: null };
      prisma.user.upsert.mockResolvedValueOnce(userDto);

      await expect(usersService.createUser(userDto)).resolves.toEqual(userDto);
    });

    it('should return new user with password', async () => {
      prisma.user.upsert.mockResolvedValueOnce(mockUsers.localUser);

      await expect(usersService.createUser(mockUsers.localUser)).resolves.toEqual(mockUsers.localUser);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      prisma.user.findMany.mockResolvedValue(mockUsers.allUsers);
      await expect(usersService.getAllUsers()).resolves.toEqual(mockUsers.allUsers);
    });
  });

  describe('getUserById', () => {
    it('should found user by ID', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUsers.localUser);

      await expect(usersService.getUserById(mockUsers.localUser.id)).resolves.toEqual(mockUsers.localUser);
    });
  });

  describe('updateUser', () => {
    it('should return the updated user if the password needs to be updated ', async () => {
      prisma.user.update.mockResolvedValue(mockUsers.localUser);

      mockUsers.localUser.password &&
        (await expect(usersService.updateUser(mockUsers.localUser.id, mockUsers.localUser)).resolves.toEqual(
          mockUsers.localUser,
        ));
    });

    it('should return updated user if password update is not required', async () => {
      const newName = 'Test-007';
      const user = { ...mockUsers.localUser, name: newName };
      prisma.user.update.mockResolvedValueOnce(user);

      mockUsers.localUser.password &&
        (await expect(usersService.updateUser(mockUsers.localUser.id, user)).resolves.toEqual(user));
    });
  });

  describe('removeUser', () => {
    it('should return deleted user', async () => {
      prisma.user.delete.mockResolvedValue(mockUsers.localUser);

      await expect(usersService.removeUser(mockUsers.localUser.id)).resolves.toEqual(mockUsers.localUser);
    });

    it('should return User Not Found', async () => {
      const errMessage = 'User Not Found.';
      prisma.user.delete.mockRejectedValueOnce(new Error(errMessage));

      await expect(usersService.removeUser(mockUsers.localUser.id)).rejects.toThrow(new Error(errMessage));
    });
  });

  describe('validateUser', () => {
    it('should return user', async () => {
      const hashedPassword = mockUsers.localUser.password && (await hash(mockUsers.localUser.password, 10));
      const user = { ...mockUsers.localUser, password: hashedPassword };
      prisma.user.findUnique.mockResolvedValue(user);

      await expect(usersService.validateUser(mockUsers.localUser.email, mockUsers.localUser.password)).resolves.toEqual(
        user,
      );
    });

    it('should return null if password equal null', async () => {
      const user = { ...mockUsers.localUser, password: null };
      prisma.user.findUnique.mockResolvedValue(user);

      await expect(usersService.validateUser(mockUsers.localUser.email, mockUsers.localUser.password)).resolves.toEqual(
        null,
      );
    });

    it('should return null if passwords does not match', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUsers.localUser);

      await expect(usersService.validateUser(mockUsers.localUser.email, mockUsers.localUser.password)).resolves.toEqual(
        null,
      );
    });

    it('should return null if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(usersService.validateUser(mockUsers.localUser.email, mockUsers.localUser.password)).resolves.toEqual(
        null,
      );
    });
  });

  describe('checkDataProvider', () => {
    it('should return user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUsers.localUser);

      await expect(usersService.checkDataProvider(mockUsers.localUser)).resolves.toEqual(mockUsers.localUser);
    });

    it('should return null if data does not match', async () => {
      const user = { ...mockUsers.localUser, name: 'Test-007' };
      prisma.user.findUnique.mockResolvedValue(mockUsers.localUser);

      await expect(usersService.checkDataProvider(user)).resolves.toEqual(null);
    });

    it('should return null if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(usersService.checkDataProvider(mockUsers.localUser)).resolves.toEqual(null);
    });
  });
});
