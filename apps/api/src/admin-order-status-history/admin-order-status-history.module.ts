import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderStatusHistory } from '../entities/order-status-history.entity';
import { AdminOrderStatusHistoryService } from './admin-order-status-history.service';
import { AdminOrderStatusHistoryController } from './admin-order-status-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderStatusHistory])],
  providers: [AdminOrderStatusHistoryService],
  controllers: [AdminOrderStatusHistoryController],
})
export class AdminOrderStatusHistoryModule {}
