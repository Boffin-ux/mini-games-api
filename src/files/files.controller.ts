import { Controller, Get, HttpStatus, NotFoundException, Post } from '@nestjs/common';
import { Delete, Param, Req, Res, UseFilters, UseInterceptors } from '@nestjs/common/decorators';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger/dist';
import { Response, Request, Express } from 'express';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Provider } from '@prisma/client';
import { URL } from 'node:url';
import { basename } from 'node:path';
import { ApiFile, CustomUploadedFile } from './decorators';
import { FilesService } from './files.service';
import { ValidateId } from '@common/validations';
import { PrismaExceptionFilter } from '@common/exceptions';
import { Access, ErrorResponse, NoCache, NoContentResponse } from '@common/decorators';
import { DEFAULT_ENV, Endpoints, FILE_TYPES, ResponseMessages } from '@common/constants';
import { UserEntity } from '@users/entities/user.entity';
import { UsersService } from '@users/users.service';
import { NotFoundInterceptor } from '@common/interceptors';

@ApiTags('Files')
@NoCache()
@Controller(Endpoints.FILES)
@UseFilters(new PrismaExceptionFilter('User'))
@ApiUnauthorizedResponse({ description: `${ResponseMessages.UNAUTHORIZED}` })
export class FilesController {
  constructor(
    private readonly configService: ConfigService,
    private filesService: FilesService,
    private usersService: UsersService,
    private readonly httpService: HttpService,
  ) {}

  @Access()
  @UseInterceptors(new NotFoundInterceptor('User'))
  @ApiOperation({ summary: 'Upload User Image' })
  @ApiCreatedResponse({ description: 'Uploaded Image' })
  @ApiUnprocessableEntityResponse({ description: 'Unprocessable Entity' })
  @ErrorResponse('User')
  @Post('upload/:userId')
  @ApiFile()
  async uploadImage(
    @CustomUploadedFile()
    file: Express.Multer.File,
    @Param('userId', ValidateId) userId: string,
    @Req() req: Request,
  ) {
    const user = await this.usersService.getUserById(userId);
    const imageUrl = new URL(`${req.protocol}:${req.get('Host')}/${Endpoints.FILES}/${file.filename}`).href;

    if (user) {
      const { id, image } = user;
      const updateUser = await this.usersService.updateUser(id, { image: imageUrl });

      image && (await this.filesService.removeFile(image));
      return new UserEntity(updateUser);
    }
  }

  @Access()
  @UseInterceptors(new NotFoundInterceptor('User'))
  @NoContentResponse('User Image')
  @ErrorResponse('User')
  @Delete(':userId')
  async removeImage(@Param('userId', ValidateId) userId: string) {
    const user = await this.usersService.getUserById(userId);

    if (user?.image) {
      const updateUser = await this.usersService.updateUser(userId, { image: null });

      await this.filesService.removeFile(user.image);
      return new UserEntity(updateUser);
    }

    return user && new UserEntity(user);
  }

  @ApiOperation({ summary: 'Get Image' })
  @ApiOkResponse({ description: 'Uploaded Image' })
  @ErrorResponse('Image')
  @Get(':userId')
  async getImage(@Param('userId', ValidateId) userId: string, @Res() res: Response) {
    const user = await this.usersService.getUserById(userId);

    if (!user?.image) {
      throw new NotFoundException();
    }

    if (user.provider === Provider.local) {
      const imageName = basename(user.image);

      return res.sendFile(
        imageName,
        { root: this.configService.get('UPLOAD_LOCATION', DEFAULT_ENV.uploads) },
        (err) => err && res.sendStatus(HttpStatus.NOT_FOUND),
      );
    }

    return this.getImageProvider(user.image, res);
  }

  private async getImageProvider(imagePath: string, @Res() res: Response) {
    const { data } = await firstValueFrom(
      this.httpService.get(imagePath, { responseType: 'arraybuffer', responseEncoding: 'base64' }).pipe(
        catchError(() => {
          throw new NotFoundException();
        }),
      ),
    );

    //If the URL contains incorrect data, GitHub may not throw an error.
    const bitmap = data.toString('hex', 0, 4);
    const imgType = Object.values(FILE_TYPES);
    const isValidImg = imgType.includes(bitmap);

    if (!isValidImg) {
      throw new NotFoundException();
    }

    return res.send(Buffer.from(data, 'base64'));
  }
}
