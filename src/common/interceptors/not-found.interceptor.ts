import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ResponseMessages } from '@common/constants';

@Injectable()
export class NotFoundInterceptor implements NestInterceptor {
  constructor(private name: string) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((data) => {
        if (!data || !Object.keys(data).length) {
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            message: `${this.name} ${ResponseMessages.NOT_FOUND}`,
          });
        }
      }),
    );
  }
}
