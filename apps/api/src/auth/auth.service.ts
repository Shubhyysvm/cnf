import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserProfile } from '../entities/user-profile.entity';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  // Store OTPs temporarily (in production, use Redis)
  private otpStore = new Map<string, { code: string; expiresAt: Date }>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  async register(
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    middleName?: string,
  ): Promise<{ message: string }> {
    // Check if user already exists
    const existing = await this.userRepository.findOne({
      where: [{ email }, { phone }],
    });

    if (existing) {
      if (existing.email === email) {
        throw new ConflictException('Email already registered');
      }
      if (existing.phone === phone) {
        throw new ConflictException('Phone number already registered');
      }
    }

    // Generate and store OTP for phone verification
    const otp = this.generateOTP();
    this.otpStore.set(phone, {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    console.log(`[Auth] OTP for ${phone}: ${otp}`); // In production, send via SMS service
    return { message: 'OTP sent successfully' };
  }

  async verifyRegister(data: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
  }) {
    // Verify OTP
    const storedOtp = this.otpStore.get(data.phone);
    if (!storedOtp || storedOtp.code !== data.otp || storedOtp.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
  // Combine first and last name for display name
  const fullName = `${data.firstName} ${data.lastName}`.trim();

  // Create user
  const user = this.userRepository.create({
    name: fullName,
    email: data.email,
    phone: data.phone,
    password: hashedPassword,
    isActive: true,
  });

  await this.userRepository.save(user);

  // Create user profile with detailed name information
  const profile = this.userProfileRepository.create({
    userId: user.id,
    firstName: data.firstName,
    middleName: data.middleName,
    lastName: data.lastName,
    phone: data.phone,
  });
  await this.userProfileRepository.save(profile);
    this.otpStore.delete(data.phone); // Clear OTP

    // Generate JWT token
    const token = this.generateJwt(user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password);
    return valid ? user : null;
  }

  async login(email: string, password: string) {
    // Validate email is provided
    if (!email || !email.trim()) {
      throw new BadRequestException('Email is required');
    }

    // Validate password is provided
    if (!password || !password.trim()) {
      throw new BadRequestException('Password is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new BadRequestException('Please enter a valid email address');
    }

    // Check if account exists
    const user = await this.userRepository.findOne({ where: { email: email.trim() } });
    if (!user) {
      throw new UnauthorizedException('No account found with this email. Please sign up first.');
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new UnauthorizedException('Incorrect password. Please try again.');
    }

    const token = this.generateJwt(user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  }

  async sendOTP(phone: string) {
    try {
      console.log('[Auth Service] sendOTP called with phone:', phone);

      // Validate phone is provided
      if (!phone || !phone.trim()) {
        throw new BadRequestException('Phone number is required');
      }

      const cleanedPhone = phone.trim();

      // Validate phone format (10 digits)
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(cleanedPhone)) {
        throw new BadRequestException('Phone number must be exactly 10 digits');
      }

      console.log('[Auth Service] Phone validation passed, checking user existence');

      // Check if user account exists
      let user;
      try {
        user = await this.userRepository.findOne({
          where: { phone: cleanedPhone, isActive: true },
        });
        console.log('[Auth Service] User lookup result:', user ? 'Found' : 'Not found');
      } catch (dbError: any) {
        console.error('[Auth Service] Database error during user lookup:', dbError.message);
        throw new BadRequestException('Error checking account. Please try again.');
      }

      if (!user) {
        throw new UnauthorizedException('No account linked to this phone number. Please sign up first.');
      }

      // Generate and send OTP
      const otp = this.generateOTP();
      this.otpStore.set(cleanedPhone, {
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });

      console.log(`[Auth Service] OTP generated for ${cleanedPhone}: ${otp}`);

      return { message: 'OTP sent successfully' };
    } catch (error: any) {
      console.error('[Auth Service] sendOTP exception:', error.message, error.status);
      throw error;
    }
  }
  async verifyOTP(phone: string, otp: string) {
    // Verify OTP
    const storedOtp = this.otpStore.get(phone);
    if (!storedOtp || storedOtp.code !== otp || storedOtp.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Get user
    const user = await this.userRepository.findOne({
      where: { phone, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.otpStore.delete(phone); // Clear OTP

    const token = this.generateJwt(user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  }

  async logout(): Promise<{ message: string }> {
    // Logout is handled client-side by clearing token and user from storage
    // This endpoint exists for completeness and can be used for server-side session cleanup if needed
    return { message: 'Logged out successfully' };
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateJwt(user: User): string {
    return jwt.sign(
      { sub: user.id, email: user.email, phone: user.phone, role: user.role },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '30d' },
    );
  }
}
