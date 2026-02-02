import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryMovement } from '../entities/inventory-movement.entity';
import { InventoryReservation } from '../entities/inventory-reservation.entity';
import { AdminInventoryService } from './admin-inventory.service';
import { AdminInventoryController } from './admin-inventory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryMovement, InventoryReservation])],
  providers: [AdminInventoryService],
  controllers: [AdminInventoryController],
})
export class AdminInventoryModule {}
