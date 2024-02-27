import { mockUsers } from '@test/stubs';

export const usersService = {
  removeUser: jest.fn().mockResolvedValueOnce(mockUsers.localUser),
  updateUser: jest.fn().mockResolvedValue(mockUsers.blockedUser),
  getAllUsers: jest.fn().mockResolvedValue(mockUsers.allUsers),
  getUserById: jest.fn().mockResolvedValue(mockUsers.localUser),
  validateUser: jest.fn().mockResolvedValue(mockUsers.localUser),
};
