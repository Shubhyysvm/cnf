import { Injectable, BadRequestException, NotFoundException, ForbiddenException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Admin, AdminRole } from '../entities/admin.entity';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { ROLE_PERMISSIONS, PERMISSION_DESCRIPTIONS } from './rbac/permissions';
import { AuditLogService } from '../audit-log/audit-log.service';

export interface AdminUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AdminRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedAdminsResponse {
  data: AdminUserResponse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Create a new admin user with role-based permissions
   */
  async createAdminUser(dto: CreateAdminUserDto, currentAdminId: string): Promise<AdminUserResponse> {
    // Check if email already exists
    const existingAdmin = await this.adminRepository.findOne({ where: { email: dto.email } });
    if (existingAdmin) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create admin user
    const admin = this.adminRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
    });

    const savedAdmin = await this.adminRepository.save(admin);

    // Log the action
    await this.auditLogService.logAction({
      adminId: currentAdminId,
      action: 'CREATE_ADMIN_USER',
      resourceType: 'admin_user',
      resourceId: savedAdmin.id,
      changes: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        role: dto.role,
      },
    });

    this.logger.log(`Admin user created: ${savedAdmin.email} (${savedAdmin.role})`);
    return this.formatAdminResponse(savedAdmin);
  }

  /**
   * Get all admin users with pagination
   */
  async getAllAdmins(
    page: number = 1,
    pageSize: number = 20,
    search?: string,
    role?: AdminRole,
  ): Promise<PaginatedAdminsResponse> {
    const query = this.adminRepository.createQueryBuilder('admin');

    if (search) {
      query.where('LOWER(CONCAT(admin.firstName, \' \', admin.lastName)) LIKE LOWER(:search) OR LOWER(admin.email) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (role) {
      query.andWhere('admin.role = :role', { role });
    }

    query.orderBy('admin.createdAt', 'DESC');

    const [data, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      data: data.map(this.formatAdminResponse),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get admin user by ID
   */
  async getAdminById(adminId: string): Promise<AdminUserResponse> {
    const admin = await this.adminRepository.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }
    return this.formatAdminResponse(admin);
  }

  /**
   * Get admin user by email
   */
  async getAdminByEmail(email: string): Promise<AdminUserResponse> {
    const admin = await this.adminRepository.findOne({ where: { email } });
    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }
    return this.formatAdminResponse(admin);
  }

  /**
   * Update admin user
   */
  async updateAdminUser(adminId: string, dto: UpdateAdminUserDto, currentAdminId: string): Promise<AdminUserResponse> {
    const admin = await this.adminRepository.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }

    const changes: Record<string, any> = {};

    if (dto.firstName && dto.firstName !== admin.firstName) {
      admin.firstName = dto.firstName;
      changes['firstName'] = dto.firstName;
    }

    if (dto.lastName && dto.lastName !== admin.lastName) {
      admin.lastName = dto.lastName;
      changes['lastName'] = dto.lastName;
    }

    if (dto.email && dto.email !== admin.email) {
      // Check if new email already exists
      const existingAdmin = await this.adminRepository.findOne({ where: { email: dto.email } });
      if (existingAdmin) {
        throw new ConflictException('Email already in use');
      }
      admin.email = dto.email;
      changes['email'] = dto.email;
    }

    if (dto.password) {
      admin.password = await bcrypt.hash(dto.password, 10);
      changes['password'] = 'changed';
    }

    if (dto.role && dto.role !== admin.role) {
      admin.role = dto.role;
      changes['role'] = dto.role;
    }

    const updatedAdmin = await this.adminRepository.save(admin);

    // Log the action
    if (Object.keys(changes).length > 0) {
      await this.auditLogService.logAction({
        adminId: currentAdminId,
        action: 'UPDATE_ADMIN_USER',
        resourceType: 'admin_user',
        resourceId: adminId,
        changes,
      });

      this.logger.log(`Admin user updated: ${updatedAdmin.email}`);
    }

    return this.formatAdminResponse(updatedAdmin);
  }

  /**
   * Soft delete admin user (set deletion flag in audit log)
   */
  async deleteAdminUser(adminId: string, currentAdminId: string): Promise<{ message: string }> {
    const admin = await this.adminRepository.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }

    // Log the deletion action
    await this.auditLogService.logAction({
      adminId: currentAdminId,
      action: 'DELETE_ADMIN_USER',
      resourceType: 'admin_user',
      resourceId: adminId,
      changes: { status: 'marked for deletion' },
    });

    this.logger.log(`Admin user marked for deletion: ${admin.email}`);
    return { message: 'Admin user marked for deletion' };
  }

  /**
   * Permanently delete admin user
   */
  async permanentlyDeleteAdminUser(adminId: string, currentAdminId: string): Promise<{ message: string }> {
    const admin = await this.adminRepository.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }

    await this.adminRepository.remove(admin);

    // Log the action
    await this.auditLogService.logAction({
      adminId: currentAdminId,
      action: 'PERMANENTLY_DELETE_ADMIN_USER',
      resourceType: 'admin_user',
      resourceId: adminId,
      changes: { deleted: true },
    });

    this.logger.log(`Admin user permanently deleted: ${admin.email}`);
    return { message: 'Admin user permanently deleted' };
  }

  /**
   * Get available permissions for a role
   */
  async getPermissionsForRole(role: AdminRole): Promise<Array<{ permission: string; description: string }>> {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.map((perm) => ({
      permission: perm,
      description: PERMISSION_DESCRIPTIONS[perm] || perm,
    }));
  }

  /**
   * Check if admin has permission
   */
  async hasPermission(adminId: string, permission: string): Promise<boolean> {
    const admin = await this.adminRepository.findOne({ where: { id: adminId } });
    if (!admin) {
      return false;
    }

    // Super admins have all permissions
    if (admin.role === AdminRole.SUPER_ADMIN) {
      return true;
    }

    // Check role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[admin.role] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Format admin response (exclude sensitive data)
   */
  private formatAdminResponse(admin: Admin): AdminUserResponse {
    return {
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }
}
