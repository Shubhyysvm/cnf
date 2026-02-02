import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/product.entity';

@Injectable()
export class AdminCategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepo: Repository<Category>,
  ) {}

  async findAll() {
    return this.categoriesRepo.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string) {
    return this.categoriesRepo.findOne({ where: { id } });
  }

  async create(data: Partial<Category>) {
    const category = this.categoriesRepo.create(data);
    return this.categoriesRepo.save(category);
  }

  async update(id: string, data: Partial<Category>) {
    await this.categoriesRepo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: string) {
    await this.categoriesRepo.delete(id);
    return { message: 'Category deleted successfully' };
  }
}