import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Temporary interface replacement until entity is available
export class AuditLog {
  id: string;
  adminId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface AuditLogEntry {
  adminId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogResponse {
  id: string;
  adminId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface PaginatedAuditLogsResponse {
  data: AuditLogResponse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Log an action
   */
  async logAction(entry: AuditLogEntry): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      adminId: entry.adminId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      changes: entry.changes,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
    });

    return await this.auditLogRepository.save(auditLog);
  }

  /**
   * Get all audit logs with pagination and filters
   */
  async getAuditLogs(
    page: number = 1,
    pageSize: number = 50,
    adminId?: string,
    action?: string,
    resourceType?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<PaginatedAuditLogsResponse> {
    const query = this.auditLogRepository.createQueryBuilder('audit');

    if (adminId) {
      query.where('audit.adminId = :adminId', { adminId });
    }

    if (action) {
      query.andWhere('audit.action = :action', { action });
    }

    if (resourceType) {
      query.andWhere('audit.resourceType = :resourceType', { resourceType });
    }

    if (startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    query.orderBy('audit.createdAt', 'DESC');

    const [data, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      data: data.map(this.formatAuditLogResponse),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get audit logs for a specific resource
   */
  async getAuditLogsForResource(
    resourceType: string,
    resourceId: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<PaginatedAuditLogsResponse> {
    const query = this.auditLogRepository.createQueryBuilder('audit')
      .where('audit.resourceType = :resourceType', { resourceType })
      .andWhere('audit.resourceId = :resourceId', { resourceId })
      .orderBy('audit.createdAt', 'DESC');

    const [data, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      data: data.map(this.formatAuditLogResponse),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get audit logs by admin
   */
  async getAuditLogsByAdmin(
    adminId: string,
    page: number = 1,
    pageSize: number = 50,
  ): Promise<PaginatedAuditLogsResponse> {
    const query = this.auditLogRepository.createQueryBuilder('audit')
      .where('audit.adminId = :adminId', { adminId })
      .orderBy('audit.createdAt', 'DESC');

    const [data, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      data: data.map(this.formatAuditLogResponse),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get audit summary (statistics)
   */
  async getAuditSummary(startDate?: Date, endDate?: Date): Promise<any> {
    const query = this.auditLogRepository.createQueryBuilder('audit');

    if (startDate) {
      query.where('audit.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    const total = await query.getCount();

    const actionCounts = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where(startDate ? 'audit.createdAt >= :startDate' : '1=1', startDate ? { startDate } : {})
      .andWhere(endDate ? 'audit.createdAt <= :endDate' : '1=1', endDate ? { endDate } : {})
      .groupBy('audit.action')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      totalActions: total,
      actionBreakdown: actionCounts.map((ac) => ({
        action: ac.action,
        count: parseInt(ac.count, 10),
      })),
    };
  }

  /**
   * Format audit log response
   */
  private formatAuditLogResponse(auditLog: AuditLog): AuditLogResponse {
    return {
      id: auditLog.id,
      adminId: auditLog.adminId,
      action: auditLog.action,
      resourceType: auditLog.resourceType,
      resourceId: auditLog.resourceId,
      changes: auditLog.changes,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      createdAt: auditLog.createdAt,
    };
  }
}
