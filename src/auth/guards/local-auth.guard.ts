import { BadRequestException, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from '@auth/dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const body = plainToClass(LoginDto, req.body);

    const errors = await validate(body);
    const errorMsg = errors.flatMap(({ constraints }) => constraints && Object.values(constraints));

    if (errorMsg.length) {
      throw new BadRequestException(errorMsg);
    }

    return super.canActivate(context) as boolean | Promise<boolean>;
  }
}
