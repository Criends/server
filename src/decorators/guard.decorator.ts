import { Reflector } from '@nestjs/core';

export const Guard = Reflector.createDecorator<string | string[]>();
