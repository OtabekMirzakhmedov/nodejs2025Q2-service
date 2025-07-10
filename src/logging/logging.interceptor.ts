import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggingService } from './logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, query, body } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        this.loggingService.logRequest(
          method,
          url,
          query,
          this.sanitizeBody(body),
          response.statusCode,
        );

        this.loggingService.log(
          `${method} ${url} - ${response.statusCode} - ${duration}ms`,
          'HTTP',
        );
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    if (sanitized.password) {
      sanitized.password = '[REDACTED]';
    }
    if (sanitized.oldPassword) {
      sanitized.oldPassword = '[REDACTED]';
    }
    if (sanitized.newPassword) {
      sanitized.newPassword = '[REDACTED]';
    }

    return sanitized;
  }
}
