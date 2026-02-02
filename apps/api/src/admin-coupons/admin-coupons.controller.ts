import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminCouponsService } from './admin-coupons.service';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('admin/coupons')
@UseGuards(RolesGuard)
export class AdminCouponsController {
  constructor(private readonly service: AdminCouponsService) {}

  @Get()
  async list(@Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    return this.service.list(parseInt(page, 10), parseInt(pageSize, 10));
  }

  @Post()
  async create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
