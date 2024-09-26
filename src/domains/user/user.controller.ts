import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { DUserSignUpByEmail } from './user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUserByEmail(@Body() data: DUserSignUpByEmail) {
    return await this.userService.signUpByEmail(data);
  }

  @Get()
  async findUserByEmail(@Param('email') email: string) {
    return await this.userService.getUserByEmail(email);
  }
}
