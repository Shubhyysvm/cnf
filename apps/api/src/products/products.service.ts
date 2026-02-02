import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, Category, Certification } from '../entities/product.entity';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepo: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepo: Repository<Category>,
    @InjectRepository(Certification)
    private certificationsRepo: Repository<Certification>,
    private productRepository: ProductRepository,
  ) {}

  async findAllProducts(params?: {
    category?: string;
    search?: string;
    featured?: boolean;
    newest?: boolean;
    bestseller?: boolean;
    sort?: 'soldCount' | 'createdAt';
    limit?: number;
    excludeProductId?: string;
  }) {
    // Delegate to centralized repository for scalability
    return this.productRepository.findProducts({
      categorySlug: params?.category,
      search: params?.search,
      featured: params?.featured,
      newest: params?.newest,
      bestseller: params?.bestseller,
      sort: params?.sort,
      limit: params?.limit,
      excludeProductId: params?.excludeProductId,
    });
  }

  async findProductBySlug(slug: string) {
    return this.productRepository.findBySlug(slug);
  }

  async autocomplete(q: string, limit = 5) {
    return this.productRepository.autocomplete(q, limit);
  }

  async findAllCategories(): Promise<(Category & { productCount: number })[]> {
    // Fetch active product counts grouped by category to avoid per-category queries
    const productCounts = await this.productsRepo
      .createQueryBuilder('product')
      .select('product.categoryId', 'categoryId')
      .addSelect('COUNT(product.id)', 'count')
      .where('product.isActive = :isActive', { isActive: true })
      .groupBy('product.categoryId')
      .getRawMany<{ categoryId: string | null; count: string }>();

    const countMap = new Map<string, number>();
    productCounts.forEach((row) => {
      if (row.categoryId) {
        countMap.set(row.categoryId, Number(row.count) || 0);
      }
    });

    const categories = await this.categoriesRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
      relations: ['parent'],
    });

    return categories.map((cat) => ({
      ...cat,
      productCount: countMap.get(cat.id) ?? 0,
    }));
  }

  async findCategoryBySlug(slug: string) {
    return this.categoriesRepo.findOne({
      where: { slug, isActive: true },
      relations: ['parent', 'children'],
    });
  }
}
