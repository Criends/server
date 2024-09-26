import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { DUserSignUpByEmail } from './user.dto';
import { Guard } from 'src/decorators/guard.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUserByEmail(@Body() data: DUserSignUpByEmail) {
    return await this.userService.signUpByEmail(data);
  }

  @Guard('user')
  @Get()
  async findUserByEmail(@Param() email: string) {
    return await this.userService.getUserByEmail(email);
  }
}
