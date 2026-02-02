import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '../entities/admin.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersController } from './admin-users.controller';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, AuditLog]), AdminAuthModule],
  providers: [AdminUsersService, AuditLogService],
  controllers: [AdminUsersController],
  exports: [AdminUsersService, AuditLogService],
})
export class AdminUsersModule {}
