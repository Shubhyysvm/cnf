import { Controller, Get, Query } from '@nestjs/common';
import { AdminOrderStatusHistoryService } from './admin-order-status-history.service';

@Controller('admin/order-status-history')
export class AdminOrderStatusHistoryController {
  constructor(private readonly service: AdminOrderStatusHistoryService) {}

  @Get()
  listByOrder(
    @Query('orderId') orderId: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '50',
  ) {
    if (!orderId) {
      return { data: [], total: 0, page: 1, pageSize: Number(pageSize), totalPages: 0 };
    }
    return this.service.listByOrder(orderId, Number(page), Number(pageSize));
  }
}
