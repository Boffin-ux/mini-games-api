import { ResponseMessages } from '@common/constants';
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const DUPLICATE_CODE = 'P2002';
const NOT_FOUND_CODE = 'P2025';
const INVALID_ID_CODE = 'P2023';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger();

  constructor(private name: string) {}

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const ctx = host.switchToHttp();
    const { url, method } = ctx.getRequest();

    let statusCode: HttpStatus;
    let message: string;

    switch (exception.code) {
      case DUPLICATE_CODE:
        statusCode = HttpStatus.CONFLICT;
        message = `${this.name} ${ResponseMessages.CONFLICT}`;
        break;
      case NOT_FOUND_CODE:
        statusCode = HttpStatus.NOT_FOUND;
        message = `${this.name} ${ResponseMessages.NOT_FOUND}`;
        break;
      case INVALID_ID_CODE:
        statusCode = HttpStatus.BAD_REQUEST;
        message = `${ResponseMessages.INCORRECT_ID}`;
        break;
      default:
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message = `${ResponseMessages.SERVER_ERROR}`;
        break;
    }

    this.logger.error(
      `Route: {${url}, ${method}}, Status Code: [${statusCode}], Message: '${message}'`,
      exception.name,
    );

    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: url,
    });
  }
}
