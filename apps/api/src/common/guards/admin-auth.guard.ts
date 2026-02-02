import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { Admin } from '../../entities/admin.entity';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | string[] | undefined = request.headers['authorization'] || request.headers['Authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    const token = headerValue.startsWith('Bearer ') ? headerValue.slice(7) : headerValue;

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme') as { sub: string };
      const admin = await this.adminRepo.findOne({ where: { id: payload.sub } });
      if (!admin) {
        throw new UnauthorizedException('Invalid token');
      }
      // Attach minimal user context for downstream guards/controllers
      request.user = { id: admin.id, email: admin.email, role: admin.role };
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
