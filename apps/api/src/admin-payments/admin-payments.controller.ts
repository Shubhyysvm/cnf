import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminPaymentsService } from './admin-payments.service';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('admin/payments')
@UseGuards(RolesGuard)
export class AdminPaymentsController {
  constructor(private readonly service: AdminPaymentsService) {}

  @Get()
  list(@Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    return this.service.list(Number(page), Number(pageSize));
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }
}
