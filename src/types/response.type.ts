export class TResponse<T> {
  success: boolean;
  result: T | null;
  message: string;
}
