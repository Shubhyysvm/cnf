import { Controller, Post, Body, HttpException, HttpStatus, BadRequestException, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, VerifyRegisterDto, LoginDto, SendOTPDto, VerifyOTPDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const result = await this.authService.register(
      body.firstName,
      body.lastName,
      body.email,
      body.phone,
      body.password,
      body.middleName,
    );
    return { success: true, ...result };
  }

  @Post('verify-register')
  async verifyRegister(@Body() body: VerifyRegisterDto) {
    const result = await this.authService.verifyRegister(body);
    return { success: true, ...result };
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const result = await this.authService.login(body.email, body.password);
    return { success: true, ...result };
  }

  @Post('send-otp')
  async sendOTP(@Body() body: SendOTPDto) {
    try {
      console.log('[Auth Controller] sendOTP called with phone:', body.phone);
      
      if (!body.phone) {
        throw new BadRequestException('Phone number is required');
      }

      const result = await this.authService.sendOTP(body.phone);
      console.log('[Auth Controller] OTP sent successfully');
      return { success: true, ...result };
    } catch (error: any) {
      console.error('[Auth Controller] sendOTP error:', error.message, error.status);
      throw error;
    }
  }

  @Post('verify-otp')
  async verifyOTP(@Body() body: VerifyOTPDto) {
    const result = await this.authService.verifyOTP(body.phone, body.otp);
    return { success: true, ...result };
  }

  @Post('logout')
  async logout() {
    const result = await this.authService.logout();
    return { success: true, ...result };
  }
}

