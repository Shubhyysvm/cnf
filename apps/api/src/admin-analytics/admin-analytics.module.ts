import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchLog } from '../entities/search-log.entity';
import { AddToCartEvent } from '../entities/add-to-cart-event.entity';
import { CheckoutAbandonment } from '../entities/checkout-abandonment.entity';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminAnalyticsController } from './admin-analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SearchLog, AddToCartEvent, CheckoutAbandonment])],
  providers: [AdminAnalyticsService],
  controllers: [AdminAnalyticsController],
})
export class AdminAnalyticsModule {}
