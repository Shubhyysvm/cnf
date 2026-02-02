import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, Product, Review, User, Payment } from '../entities/index';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, Review, User, Payment])],
  providers: [DashboardService],
  controllers: [DashboardController],
  exports: [DashboardService],
})
export class AdminDashboardModule {}
