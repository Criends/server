import { SetMetadata } from '@nestjs/common';
import { AccountEntity } from 'src/types/account.type';

export const Guard = (accountType: AccountEntity) =>
  SetMetadata('accountType', accountType);
