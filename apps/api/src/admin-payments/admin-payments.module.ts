import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { AdminPaymentsService } from './admin-payments.service';
import { AdminPaymentsController } from './admin-payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  providers: [AdminPaymentsService],
  controllers: [AdminPaymentsController],
})
export class AdminPaymentsModule {}
