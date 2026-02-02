import { IsEmail, IsString, IsEnum, MinLength, IsNotEmpty, Matches } from 'class-validator';
import { AdminRole } from '../../entities/admin.entity';

export class CreateAdminUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;

  @IsEnum(AdminRole)
  @IsNotEmpty()
  role: AdminRole;

  @IsString()
  permissions?: string[]; // Custom permissions (will be validated against role)
}
