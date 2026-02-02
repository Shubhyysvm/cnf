import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryMovement } from '../entities/inventory-movement.entity';
import { InventoryReservation } from '../entities/inventory-reservation.entity';

@Injectable()
export class AdminInventoryService {
  constructor(
    @InjectRepository(InventoryMovement) private readonly movementRepo: Repository<InventoryMovement>,
    @InjectRepository(InventoryReservation) private readonly reservationRepo: Repository<InventoryReservation>,
  ) {}

  async listMovements(page = 1, pageSize = 20, variantId?: string) {
    const where = variantId ? { variantId } : {} as any;
    const [data, total] = await this.movementRepo.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' as any },
    });
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async listReservations(page = 1, pageSize = 20, variantId?: string) {
    const where = variantId ? { variantId } : {} as any;
    const [data, total] = await this.reservationRepo.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { reservedAt: 'DESC' as any },
    });
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}
