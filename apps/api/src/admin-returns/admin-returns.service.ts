import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnEntity } from '../entities/return.entity';

@Injectable()
export class AdminReturnsService {
  constructor(@InjectRepository(ReturnEntity) private readonly repo: Repository<ReturnEntity>) {}

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
