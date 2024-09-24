import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserSignUpByEmail } from './user.dto';

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
}
