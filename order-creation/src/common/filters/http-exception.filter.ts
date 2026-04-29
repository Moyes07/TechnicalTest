import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export const ErrorCodes = {
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  ALLERGEN_CONFLICT: 'ALLERGEN_CONFLICT',
  ITEM_UNAVAILABLE: 'ITEM_UNAVAILABLE',
  PARENT_NOT_FOUND: 'PARENT_NOT_FOUND',
  STUDENT_NOT_FOUND: 'STUDENT_NOT_FOUND',
  MENU_ITEM_NOT_FOUND: 'MENU_ITEM_NOT_FOUND',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  INVALID_REQUEST: 'INVALID_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export class BusinessException extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = HttpStatus.UNPROCESSABLE_ENTITY,
  ) {
    super(message);
    this.name = 'BusinessException';
  }
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ErrorCodes.INTERNAL_ERROR;
    let message = 'An unexpected error occurred';

    if (exception instanceof BusinessException) {
      statusCode = exception.statusCode;
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null) {
        const b = body as any;
        message = Array.isArray(b.message) ? b.message.join('; ') : (b.message ?? message);
        code = b.code ?? ErrorCodes.INVALID_REQUEST;
      } else {
        message = String(body);
        code = ErrorCodes.INVALID_REQUEST;
      }
    } else {
      this.logger.error('Unhandled exception', exception);
    }

    response.status(statusCode).json({
      code,
      message,
      statusCode,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}