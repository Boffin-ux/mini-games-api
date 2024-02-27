import { Body, ClassSerializerInterceptor, Controller, Get } from '@nestjs/common';
import { Delete, Param, Patch, Put, Query, UseFilters, UseInterceptors } from '@nestjs/common/decorators';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger/dist';
import { UsersService } from './users.service';
import { PatchUserDto, UpdateUserDto } from './dto';
import { UserEntity } from './entities/user.entity';
import { FilesService } from '@files/files.service';
import { Endpoints, ResponseMessages } from '@common/constants';
import { ValidateId } from '@common/validations';
import { PrismaExceptionFilter } from '@common/exceptions';
import { Access, ErrorResponse, NoContentResponse, Role } from '@common/decorators';
import { User, UserRole } from '@prisma/client';

@ApiTags('Users')
@Controller(Endpoints.USERS)
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new PrismaExceptionFilter('User'))
@ApiUnauthorizedResponse({ description: ResponseMessages.UNAUTHORIZED })
export class UsersController {
  constructor(
    private usersService: UsersService,
    private filesService: FilesService,
  ) {}

  @Role(UserRole.Admin)
  @ApiOperation({ summary: 'Get All Users' })
  @ApiOkResponse({ description: 'All users on server' })
  @Get('')
  async getAll() {
    const users = await this.usersService.getAllUsers();
    return users.map((user: User) => new UserEntity(user));
  }

  @Access()
  @ApiOperation({ summary: 'Get User By Id' })
  @ApiOkResponse({ description: 'Found user' })
  @ErrorResponse('User')
  @Get(':userId')
  async getUser(@Param('userId', ValidateId) id: string) {
    const user = await this.usersService.getUserById(id);
    return user && new UserEntity(user);
  }

  @Access()
  @ApiOperation({ summary: 'Update User by ID' })
  @ApiOkResponse({ description: 'User updated' })
  @ErrorResponse('User')
  @Put(':userId')
  async update(@Body() userDto: UpdateUserDto, @Param('userId', ValidateId) userId: string) {
    const updateUser = await this.usersService.updateUser(userId, userDto);
    return new UserEntity(updateUser);
  }

  @Role(UserRole.Admin)
  @ApiQuery({ name: 'isBlocked', type: Boolean, enum: ['true', 'false'] })
  @ApiOperation({ summary: 'Block User by ID' })
  @ApiOkResponse({ description: 'User updated' })
  @ErrorResponse('User')
  @Patch(':userId')
  async patch(@Query() { isBlocked }: PatchUserDto, @Param('userId', ValidateId) userId: string) {
    const patchUser = await this.usersService.updateUser(userId, { isBlocked });
    return new UserEntity(patchUser);
  }

  @Access()
  @NoContentResponse('User')
  @ErrorResponse('User')
  @Delete(':userId')
  async remove(@Param('userId', ValidateId) userId: string) {
    const user = await this.usersService.removeUser(userId);

    if (user.image) {
      await this.filesService.removeFile(user.image);
    }

    return new UserEntity(user);
  }
}
