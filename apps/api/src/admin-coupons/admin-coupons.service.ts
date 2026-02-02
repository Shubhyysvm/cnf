import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';

@Injectable()
export class AdminCouponsService {
  constructor(@InjectRepository(Coupon) private readonly repo: Repository<Coupon>) {}

  async list(page = 1, pageSize = 20) {
    const [data, total] = await this.repo.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' as any },
    });
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async create(dto: Partial<Coupon>) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async get(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: string, dto: Partial<Coupon>) {
    const entity = await this.get(id);
    if (!entity) return null;
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string) {
    await this.repo.delete({ id });
    return { success: true };
  }
}
