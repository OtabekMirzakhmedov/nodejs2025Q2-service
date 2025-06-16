import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggingService } from './logging.service';

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {}

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorMessage = `${request.method} ${request.url} - ${httpStatus} - ${
      typeof exceptionMessage === 'string'
        ? exceptionMessage
        : JSON.stringify(exceptionMessage)
    }`;

    this.loggingService.error(errorMessage, exception.stack, 'ExceptionFilter');

    const responseMessage =
      httpStatus === HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Internal server error'
        : exceptionMessage;

    response.status(httpStatus).json({
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: responseMessage,
    });
  }
}
