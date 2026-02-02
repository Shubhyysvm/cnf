import { Controller, Get, Query } from '@nestjs/common';
import { AdminInventoryService } from './admin-inventory.service';

@Controller('admin/inventory')
export class AdminInventoryController {
  constructor(private readonly service: AdminInventoryService) {}

  @Get('movements')
  listMovements(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('variantId') variantId?: string,
  ) {
    return this.service.listMovements(Number(page), Number(pageSize), variantId);
  }

  @Get('reservations')
  listReservations(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('variantId') variantId?: string,
  ) {
    return this.service.listReservations(Number(page), Number(pageSize), variantId);
  }
}
