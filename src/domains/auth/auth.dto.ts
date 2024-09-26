import { IsEmail, IsString } from 'class-validator';

export class DUserSignInByEmail {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
