import { FilesService } from '@files/files.service';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter<T> implements ExceptionFilter {
  private readonly logger = new Logger();

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private filesService: FilesService,
  ) {}

  async catch(exception: T, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const { url, method, file } = ctx.getRequest();
    const isHttpException = exception instanceof HttpException;

    if (url === '/favicon.ico') {
      res.writeHead(200, { 'Content-Type': 'image/x-icon' });
      res.end();
      return;
    }

    if (file) {
      await this.filesService.removeFile(file.path);
    }

    const statusCode = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isHttpException ? exception['response']['message'] : String(exception);

    const name = isHttpException && exception.name;
    const responseBody = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: url,
    };

    this.logger.error(`Route: {${url}, ${method}}, Status Code: [${statusCode}], Message: '${message}'`, name);
    httpAdapter.reply(res, responseBody, statusCode);
  }
}
