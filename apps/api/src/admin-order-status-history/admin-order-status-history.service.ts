import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatusHistory } from '../entities/order-status-history.entity';

@Injectable()
export class AdminOrderStatusHistoryService {
  constructor(@InjectRepository(OrderStatusHistory) private readonly repo: Repository<OrderStatusHistory>) {}

  async listByOrder(orderId: string, page = 1, pageSize = 50) {
    const [data, total] = await this.repo.findAndCount({
      where: { orderId } as any,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' as any },
    });
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}
