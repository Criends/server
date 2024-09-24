import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { TExceptionResponse, TResponse } from 'src/types/response.type';

type ErrorWithStatus = Error & { getStatus?: () => number };

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: ErrorWithStatus, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = this.getMessage(exception);
    const statusCode = this.getStatusCode(exception);

    const errorResponse: TResponse<null> = {
      statusCode: statusCode,
      message,
    };

    return response.status(statusCode).json(errorResponse);
  }

  private getStatusCode(exception: ErrorWithStatus): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.BAD_REQUEST;
  }

  private getMessage(exception: ErrorWithStatus): string {
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse() as TExceptionResponse;
      return typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse.message;
    }
    return exception.message;
  }
}
