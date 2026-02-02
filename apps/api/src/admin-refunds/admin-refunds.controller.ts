import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminRefundsService } from './admin-refunds.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';

@Controller('admin/refunds')
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminRefundsController {
  constructor(private readonly service: AdminRefundsService) {}

  @Get()
  list(@Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    return this.service.list(Number(page), Number(pageSize));
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }
}
