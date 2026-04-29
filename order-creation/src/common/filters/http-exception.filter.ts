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

type ErrorResponseBody = {
  message?: unknown;
  code?: unknown;
};

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

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeErrorMessage(
  messageValue: unknown,
  fallbackMessage: string,
): string {
  if (Array.isArray(messageValue)) {
    const stringMessages = messageValue.filter(
      (messageEntry): messageEntry is string =>
        typeof messageEntry === 'string',
    );
    return stringMessages.length > 0
      ? stringMessages.join('; ')
      : fallbackMessage;
  }

  if (typeof messageValue === 'string') {
    return messageValue;
  }

  return fallbackMessage;
}

function normalizeErrorCode(codeValue: unknown, fallbackCode: string): string {
  return typeof codeValue === 'string' ? codeValue : fallbackCode;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse<Response>();
    const request = httpContext.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode: string = ErrorCodes.INTERNAL_ERROR;
    let errorMessage = 'An unexpected error occurred';

    if (exception instanceof BusinessException) {
      statusCode = exception.statusCode;
      errorCode = exception.code;
      errorMessage = exception.message;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (isObjectRecord(exceptionResponse)) {
        const typedResponseBody = exceptionResponse as ErrorResponseBody;
        errorMessage = normalizeErrorMessage(
          typedResponseBody.message,
          errorMessage,
        );
        errorCode = normalizeErrorCode(
          typedResponseBody.code,
          ErrorCodes.INVALID_REQUEST,
        );
      } else if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
        errorCode = ErrorCodes.INVALID_REQUEST;
      } else {
        errorCode = ErrorCodes.INVALID_REQUEST;
      }
    } else {
      this.logger.error('Unhandled exception', exception);
    }

    response.status(statusCode).json({
      code: errorCode,
      message: errorMessage,
      statusCode,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
