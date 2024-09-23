import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { Guard } from 'src/decorators/guard.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Guard('admin')
  getSth() {
    return 'hi';
  }
}
