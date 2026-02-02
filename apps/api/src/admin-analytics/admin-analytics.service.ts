import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchLog } from '../entities/search-log.entity';
import { AddToCartEvent } from '../entities/add-to-cart-event.entity';
import { CheckoutAbandonment } from '../entities/checkout-abandonment.entity';

@Injectable()
export class AdminAnalyticsService {
  constructor(
    @InjectRepository(SearchLog) private readonly searchRepo: Repository<SearchLog>,
    @InjectRepository(AddToCartEvent) private readonly addToCartRepo: Repository<AddToCartEvent>,
    @InjectRepository(CheckoutAbandonment) private readonly checkoutRepo: Repository<CheckoutAbandonment>,
  ) {}

  async listSearchLogs(page = 1, pageSize = 20) {
    const [data, total] = await this.searchRepo.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' as any },
    });
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async listAddToCartEvents(page = 1, pageSize = 20) {
    const [data, total] = await this.addToCartRepo.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' as any },
    });
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async listCheckoutAbandonments(page = 1, pageSize = 20) {
    const [data, total] = await this.checkoutRepo.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' as any },
    });
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}
