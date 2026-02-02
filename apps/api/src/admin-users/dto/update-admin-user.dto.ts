import { IsEmail, IsString, IsEnum, IsOptional, MinLength, Matches } from 'class-validator';
import { AdminRole } from '../../entities/admin.entity';

export class UpdateAdminUserDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  password?: string;

  @IsEnum(AdminRole)
  @IsOptional()
  role?: AdminRole;
}
