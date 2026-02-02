import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Refund } from '../entities/refund.entity';
import { Admin } from '../entities/admin.entity';
import { AdminRefundsService } from './admin-refunds.service';
import { AdminRefundsController } from './admin-refunds.controller';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Refund, Admin])],
  providers: [AdminRefundsService, AdminAuthGuard],
  controllers: [AdminRefundsController],
})
export class AdminRefundsModule {}
