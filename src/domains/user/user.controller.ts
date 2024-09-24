import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserSignUpByEmail } from './user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUserByEmail(@Body() data: UserSignUpByEmail) {
    console.log('controller');
    console.log(data);
    const newUser = this.userService.signUpByEmail(data);

    return newUser;
  }

  @Get()
  async findUserByEmail(@Query('email') email: string): Promise<User | null> {
    const foundUser = await this.userService.getUserInfo(email);

    return foundUser;
  }
}
