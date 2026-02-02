import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin, AdminRole } from '../entities/admin.entity';
import { AdminSignupDto } from './dto/signup.dto';
import { AdminLoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  private sanitize(admin: Admin) {
    const name = `${admin.firstName} ${admin.lastName}`.trim();
    return {
      id: admin.id,
      email: admin.email,
      name,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role as AdminRole,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }

  private generateToken(admin: Admin) {
    return jwt.sign(
      { sub: admin.id, email: admin.email, role: admin.role, type: 'admin' },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '7d' },
    );
  }

  async signup(dto: AdminSignupDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existing = await this.adminRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const admin = this.adminRepo.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email.toLowerCase(),
      password: hashed,
      role: AdminRole.ADMIN,
    });

    const saved = await this.adminRepo.save(admin);
    const token = this.generateToken(saved);
    return { token, user: this.sanitize(saved) };
  }

  async login(dto: AdminLoginDto) {
    const admin = await this.adminRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, admin.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.generateToken(admin);
    return { token, user: this.sanitize(admin) };
  }

  async me(token: string) {
    if (!token) throw new UnauthorizedException('No token provided');
    const parsed = token.startsWith('Bearer ') ? token.replace('Bearer ', '') : token;
    try {
      const payload = jwt.verify(parsed, process.env.JWT_SECRET || 'changeme') as { sub: string };
      const admin = await this.adminRepo.findOne({ where: { id: payload.sub } });
      if (!admin) throw new UnauthorizedException('Invalid token');
      return this.sanitize(admin);
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
