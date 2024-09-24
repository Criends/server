import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class UserSignUpByEmail {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 12)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
  password: string;
}
