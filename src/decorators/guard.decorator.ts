import { SetMetadata } from '@nestjs/common';
import { AccountType } from 'src/types/account.type';

export const Guard = (accountType: AccountType) =>
  SetMetadata('accountType', accountType);
