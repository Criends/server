import { SetMetadata } from '@nestjs/common';

export const Guard = (...roles: string[]) => SetMetadata('roles', roles);
