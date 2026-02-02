import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AdminReviewsService } from './admin-reviews.service';
import { RolesGuard, AdminRole } from '../common/guards/roles.guard';

@Controller('admin/reviews')
@UseGuards(RolesGuard)
export class AdminReviewsController {
  constructor(private readonly service: AdminReviewsService) {}

  @Get()
  async list(@Query('page') page = '1', @Query('pageSize') pageSize = '20', @Query('status') status?: string) {
    return this.service.list(parseInt(page, 10), parseInt(pageSize, 10), status as any);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: 'pending' | 'approved' | 'rejected' }) {
    return this.service.updateStatus(id, body.status);
  }
}
