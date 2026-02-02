import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminSignupDto } from './dto/signup.dto';
import { AdminLoginDto } from './dto/login.dto';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('signup')
  async signup(@Body() body: AdminSignupDto) {
    return this.adminAuthService.signup(body);
  }

  @Post('login')
  async login(@Body() body: AdminLoginDto) {
    return this.adminAuthService.login(body);
  }

  @Get('me')
  async me(@Headers('authorization') authHeader: string) {
    return this.adminAuthService.me(authHeader);
  }
}
