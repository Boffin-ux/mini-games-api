import { Test } from '@nestjs/testing';
import { UsersService } from '@users/users.service';
import { UsersController } from '@users/users.controller';
import { FilesService } from '@files/files.service';
import { filesService, usersService as mockUsersService } from '@test/__mocks__';
import { UserEntity } from '@users/entities/user.entity';
import { localDto, mockUsers } from '@test/stubs';

describe('UsersController unit tests', () => {
  let usersController: UsersController;
  let usersService: Pick<jest.MockedObject<UsersService>, 'removeUser'>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return mockUsersService;
        }
        if (token === FilesService) {
          return filesService;
        }
      })
      .compile();

    usersController = moduleRef.get<UsersController>(UsersController);
    usersService = moduleRef.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined UsersService', () => {
    expect(usersController).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      await expect(usersController.getAll()).resolves.toEqual(mockUsers.allUsers);
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      await expect(usersController.getUser(mockUsers.localUser.id)).resolves.toEqual(mockUsers.localUser);
    });
  });

  describe('updateUser', () => {
    it('should return the updated user if the password needs to be updated', async () => {
      await expect(usersController.update(localDto.update, mockUsers.blockedUser.id)).resolves.toEqual(
        mockUsers.blockedUser,
      );
    });
  });

  describe('patchUser', () => {
    it('should return the unlocked user', async () => {
      const userEntity = new UserEntity({ ...mockUsers.blockedUser, isBlocked: false });
      mockUsersService.updateUser.mockResolvedValue(userEntity);

      await expect(usersController.patch({ isBlocked: false }, mockUsers.localUser.id)).resolves.toEqual(userEntity);
    });

    it('should return the blocked user', async () => {
      const userEntity = new UserEntity({ ...mockUsers.blockedUser, isBlocked: true });
      mockUsersService.updateUser.mockResolvedValue(userEntity);

      await expect(usersController.patch({ isBlocked: true }, mockUsers.localUser.id)).resolves.toEqual(userEntity);
    });
  });

  describe('removeUser', () => {
    it('should return deleted user without image', async () => {
      await expect(usersController.remove(mockUsers.localUser.id)).resolves.toEqual(mockUsers.localUser);
    });

    it('should return deleted user with image', async () => {
      usersService.removeUser.mockResolvedValueOnce(mockUsers.blockedUser);
      await expect(usersController.remove(mockUsers.blockedUser.id)).resolves.toEqual(mockUsers.blockedUser);
    });
  });
});
