import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TResponse } from 'src/types/response.type';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, TResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object') {
          return data;
        }
        return {
          success: true,
          data: data,
          message: null,
        };
      }),
    );
  }
}
