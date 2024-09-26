import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Guard } from 'src/decorators/guard.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  secretKey = this.configService.get('JWT_SECRET_KEY');

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get(Guard, context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer') throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.secretKey,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    const user = request.user;
    return roles === user.accountType;
  }
}
