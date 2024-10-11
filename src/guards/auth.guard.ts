import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly secretKey: string;
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
    // private usersService: UserService,
  ) {
    this.secretKey = this.configService.get<string>('JWT_SECRET_KEY');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const token = request.cookies['accessToken'];

    if (!token) {
      throw new UnauthorizedException();
    }

    const decodedToken = this.verifyToken(token);

    if (!roles.includes(decodedToken.accountType))
      throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.secretKey,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secretKey);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
