import { Controller, Get, Param, Query, Headers, BadRequestException } from '@nestjs/common';
import { AuditLogService, PaginatedAuditLogsResponse } from './audit-log.service';
import { AdminAuthService } from '../admin-auth/admin-auth.service';
import { AdminRole } from '../entities/admin.entity';

@Controller('admin/audit-logs')
export class AuditLogController {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly adminAuthService: AdminAuthService,
  ) {}

  /**
   * Get all audit logs
   */
  @Get()
  async getAuditLogs(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '50',
    @Query('adminId') adminId?: string,
    @Query('action') action?: string,
    @Query('resourceType') resourceType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Headers('authorization') authHeader?: string,
  ): Promise<PaginatedAuditLogsResponse> {
    return this.auditLogService.getAuditLogs(
      parseInt(page, 10),
      parseInt(pageSize, 10),
      adminId,
      action,
      resourceType,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Get audit logs by admin
   */
  @Get('admin/:adminId')
  async getAuditLogsByAdmin(
    @Param('adminId') adminId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '50',
  ): Promise<PaginatedAuditLogsResponse> {
    return this.auditLogService.getAuditLogsByAdmin(
      adminId,
      parseInt(page, 10),
      parseInt(pageSize, 10),
    );
  }

  /**
   * Get audit logs for a specific resource
   */
  @Get('resource/:resourceType/:resourceId')
  async getAuditLogsForResource(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ): Promise<PaginatedAuditLogsResponse> {
    return this.auditLogService.getAuditLogsForResource(
      resourceType,
      resourceId,
      parseInt(page, 10),
      parseInt(pageSize, 10),
    );
  }

  /**
   * Get audit summary
   */
  @Get('summary')

  async getAuditSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    return this.auditLogService.getAuditSummary(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
