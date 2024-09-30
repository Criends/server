import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AccountType } from 'src/types/account.type';

export const DAccount = createParamDecorator(
  (data: AccountType, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request[data];
  },
);
