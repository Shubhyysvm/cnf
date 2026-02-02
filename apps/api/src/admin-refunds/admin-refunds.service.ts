import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Refund } from '../entities/refund.entity';

@Injectable()
export class AdminRefundsService {
  constructor(@InjectRepository(Refund) private readonly repo: Repository<Refund>) {}

  async list(page = 1, pageSize = 20) {
    const [data, total] = await this.repo.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' as any },
    });
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async get(id: string) {
    return this.repo.findOne({ where: { id } });
  }
}
