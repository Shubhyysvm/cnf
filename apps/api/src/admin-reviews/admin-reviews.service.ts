import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';

@Injectable()
export class AdminReviewsService {
  constructor(@InjectRepository(Review) private readonly repo: Repository<Review>) {}

  async list(page = 1, pageSize = 20, status?: 'pending' | 'approved' | 'rejected') {
    const where = status ? { status } : {};
    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' as any },
    });
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async updateStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    const review = await this.repo.findOne({ where: { id } });
    if (!review) return null;
    review.status = status;
    return this.repo.save(review);
  }
}
