import { Controller, Get, Query } from '@nestjs/common';
import { AdminAnalyticsService } from './admin-analytics.service';

@Controller('admin/analytics')
export class AdminAnalyticsController {
  constructor(private readonly service: AdminAnalyticsService) {}

  @Get('search-logs')
  listSearchLogs(@Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    return this.service.listSearchLogs(Number(page), Number(pageSize));
  }

  @Get('add-to-cart-events')
  listAddToCartEvents(@Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    return this.service.listAddToCartEvents(Number(page), Number(pageSize));
  }

  @Get('checkout-abandonments')
  listCheckoutAbandonments(@Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    return this.service.listCheckoutAbandonments(Number(page), Number(pageSize));
  }
}
