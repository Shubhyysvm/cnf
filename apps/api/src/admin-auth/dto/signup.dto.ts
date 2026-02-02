import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class AdminSignupDto {
  @IsNotEmpty()
  @Matches(/^[A-Za-z ]+$/, {
    message: 'First name can only contain letters and spaces',
  })
  firstName: string;

  @IsNotEmpty()
  @Matches(/^[A-Za-z ]+$/, {
    message: 'Last name can only contain letters and spaces',
  })
  lastName: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @IsNotEmpty({ message: 'Confirm password is required' })
  confirmPassword: string;
}
