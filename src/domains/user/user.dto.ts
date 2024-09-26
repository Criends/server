import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class User {
  id: string;
  email: string;
  updatedAt: Date;
  password: string;
}
export class DUserSignUpByEmail {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 12)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
  password: string;
}
