import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Headers,
  BadRequestException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { AdminUsersService, AdminUserResponse, PaginatedAdminsResponse } from './admin-users.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { AdminRole } from '../entities/admin.entity';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { AdminAuthService } from '../admin-auth/admin-auth.service';

@ApiTags('Admin Management')
@Controller('admin/users')
export class AdminUsersController {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly adminAuthService: AdminAuthService,
  ) {}

  /**
   * Get current admin's info from token
   */
  @Get('me')
  async getCurrentAdmin(@Headers('authorization') authHeader: string): Promise<AdminUserResponse> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Invalid authorization header');
    }

    const token = authHeader.substring(7);
    const admin = await this.adminAuthService.me(token);
    return admin as any;
  }

  /**
   * Create new admin user (Super Admin only)
   */
  @Post()
  async createAdminUser(
    @Body(ValidationPipe) dto: CreateAdminUserDto,
    @Headers('authorization') authHeader: string,
  ): Promise<AdminUserResponse> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Invalid authorization header');
    }

    const token = authHeader.substring(7);
    const currentAdmin = await this.adminAuthService.me(token);

    // Only Super Admin can create users
    if (currentAdmin.role !== AdminRole.SUPER_ADMIN) {
      throw new BadRequestException('Only Super Admin can create users');
    }

    return this.adminUsersService.createAdminUser(dto, currentAdmin.id);
  }

  /**
   * Get all admin users with pagination and filters
   */
  @Get()
  async getAllAdmins(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('search') search?: string,
    @Query('role') role?: AdminRole,
    @Headers('authorization') authHeader?: string,
  ): Promise<PaginatedAdminsResponse> {
    return this.adminUsersService.getAllAdmins(
      parseInt(page, 10),
      parseInt(pageSize, 10),
      search,
      role,
    );
  }

  /**
   * Get admin user by ID
   */
  @Get(':id')
  async getAdminById(@Param('id') adminId: string): Promise<AdminUserResponse> {
    return this.adminUsersService.getAdminById(adminId);
  }

  /**
   * Update admin user
   */
  @Put(':id')
  async updateAdminUser(
    @Param('id') adminId: string,
    @Body(ValidationPipe) dto: UpdateAdminUserDto,
    @Headers('authorization') authHeader: string,
  ): Promise<AdminUserResponse> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Invalid authorization header');
    }

    const token = authHeader.substring(7);
    const currentAdmin = await this.adminAuthService.me(token);

    return this.adminUsersService.updateAdminUser(adminId, dto, currentAdmin.id);
  }

  /**
   * Delete admin user (deactivate)
   */
  @Delete(':id')
  async deleteAdminUser(
    @Param('id') adminId: string,
    @Headers('authorization') authHeader: string,
  ): Promise<{ message: string }> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Invalid authorization header');
    }

    const token = authHeader.substring(7);
    const currentAdmin = await this.adminAuthService.me(token);

    return this.adminUsersService.deleteAdminUser(adminId, currentAdmin.id);
  }

  /**
   * Check if admin has permission
   */
  @Get(':id/has-permission/:permission')
  async hasPermission(
    @Param('id') adminId: string,
    @Param('permission') permission: string,
  ): Promise<{ hasPermission: boolean }> {
    const hasPermission = await this.adminUsersService.hasPermission(adminId, permission);
    return { hasPermission };
  }

  /**
   * Get permissions for a role
   */
  @Get('role/:role/permissions')
  async getPermissionsForRole(@Param('role') role: AdminRole): Promise<any> {
    return this.adminUsersService.getPermissionsForRole(role);
  }
}
