import { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util';

export class TResponse<T> {
  statusCode?: ErrorHttpStatusCode;
  success?: boolean;
  result?: T | null;
  message: string;
}

export type TExceptionResponse = string | { message: string; error?: string };
