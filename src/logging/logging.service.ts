import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggingService {
  private logger: winston.Logger;
  private errorLogger: winston.Logger;

  constructor() {
    this.createLoggers();
  }

  private createLoggers() {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const maxFileSize = process.env.LOG_MAX_FILE_SIZE || '1000k';
    const maxFiles = process.env.LOG_MAX_FILES || '10d';

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} [${level.toUpperCase()}] ${message}${stack ? '\n' + stack : ''}`;
        }),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new winston.transports.DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: maxFileSize,
          maxFiles: maxFiles,
        }),
      ],
    });

    this.errorLogger = winston.createLogger({
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} [${level.toUpperCase()}] ${message}${stack ? '\n' + stack : ''}`;
        }),
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: maxFileSize,
          maxFiles: maxFiles,
          level: 'error',
        }),
      ],
    });
  }

  debug(message: string, context?: string) {
    this.logger.debug(this.formatMessage(message, context));
  }

  log(message: string, context?: string) {
    this.logger.info(this.formatMessage(message, context));
  }

  warn(message: string, context?: string) {
    this.logger.warn(this.formatMessage(message, context));
  }

  error(message: string, trace?: string, context?: string) {
    const formattedMessage = this.formatMessage(message, context);
    this.logger.error(formattedMessage, { stack: trace });
    this.errorLogger.error(formattedMessage, { stack: trace });
  }

  private formatMessage(message: string, context?: string): string {
    return context ? `[${context}] ${message}` : message;
  }

  logRequest(
    method: string,
    url: string,
    query: any,
    body: any,
    statusCode: number,
  ) {
    const message = `${method} ${url} - ${statusCode} - Query: ${JSON.stringify(query)} - Body: ${JSON.stringify(body)}`;
    this.logger.info(message);
  }
}
