import { Controller, Get, Param, Query } from '@nestjs/common';
import { AdminReturnsService } from './admin-returns.service';

@Controller('admin/returns')
export class AdminReturnsController {
  constructor(private readonly service: AdminReturnsService) {}

  @Get()
  list(@Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    return this.service.list(Number(page), Number(pageSize));
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }
}
