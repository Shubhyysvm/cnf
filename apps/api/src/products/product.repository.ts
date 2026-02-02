import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { Product, ProductVariant } from '../entities/product.entity';

/**
 * Centralized repository for all product-related database operations.
 * Single source of truth for product queries - changes to DB structure only need updates here.
 */
@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  /**
   * Find products with flexible filtering, sorting, and pagination
   */
  async findProducts(options: {
    categorySlug?: string;
    search?: string;
    featured?: boolean;
    newest?: boolean;
    bestseller?: boolean;
    sort?: 'soldCount' | 'createdAt' | 'price';
    limit?: number;
    offset?: number;
    excludeProductId?: string;
  }): Promise<Product[]> {
    // First, get product IDs with filters applied
    const idQuery = this.productRepo
      .createQueryBuilder('product')
      .select('product.id')
      .where('product.isActive = :active', { active: true });

    if (options.categorySlug) {
      idQuery.innerJoin('product.category', 'category')
        .andWhere('category.slug = :slug', { slug: options.categorySlug });
    }

    if (options.search) {
      idQuery.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options.featured) {
      idQuery.andWhere('product.isFeatured = :featured', { featured: true });
    }

    if (options.newest) {
      idQuery.andWhere('product.isLatestArrival = :newest', { newest: true });
    }

    if (options.bestseller) {
      idQuery.andWhere('product.isBestSeller = :bestseller', { bestseller: true });
    }

    if (options.excludeProductId) {
      idQuery.andWhere('product.id != :excludeId', { excludeId: options.excludeProductId });
    }

    // Sorting
    if (options.sort === 'soldCount') {
      idQuery.orderBy('product.soldCount', 'DESC');
    } else if (options.sort === 'createdAt') {
      idQuery.orderBy('product.createdAt', 'DESC');
    } else if (options.sort === 'price') {
      idQuery.orderBy('product.price', 'ASC');
    } else {
      // Default sort by soldCount (featured products)
      idQuery.orderBy('product.soldCount', 'DESC');
    }

    if (options.limit) {
      idQuery.limit(options.limit);
    }

    if (options.offset) {
      idQuery.offset(options.offset);
    }

    const productIds = await idQuery.getRawMany();
    
    if (productIds.length === 0) {
      return [];
    }

    // Now fetch full products with all relations
    const ids = productIds.map(p => p.product_id);
    
    return this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.certifications', 'certifications')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.id IN (:...ids)', { ids })
      .orderBy('product.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Find a single product by slug with all relations
   */
  async findBySlug(slug: string): Promise<Product | null> {
    return this.productRepo.findOne({
      where: { slug, isActive: true },
      relations: ['category', 'certifications', 'variants', 'images'],
    });
  }

  /**
   * Autocomplete search for product names
   */
  async autocomplete(query: string, limit = 10): Promise<Partial<Product>[]> {
    if (!query || query.trim().length < 2) return [];

    const products = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .select(['product.id', 'product.slug', 'product.name', 'product.price', 'images.imageUrl'])
      .where('product.isActive = :active', { active: true })
      .andWhere('product.name ILIKE :query', { query: `%${query}%` })
      .orderBy('product.soldCount', 'DESC')
      .addOrderBy('images.imageType', 'ASC')
      .limit(limit)
      .getMany();

    return products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      imageUrl: p.images?.[0]?.imageUrl || null,
    }));
  }

  /**
   * Create or update a product
   */
  async save(product: Partial<Product>): Promise<Product> {
    return this.productRepo.save(product);
  }

  /**
   * Get variants for a product
   */
  async getVariants(productId: string): Promise<ProductVariant[]> {
    return this.variantRepo.find({
      where: { product: { id: productId }, isActive: true },
      order: { price: 'ASC' },
    });
  }

  /**
   * Create or update a variant
   */
  async saveVariant(variant: Partial<ProductVariant>): Promise<ProductVariant> {
    return this.variantRepo.save(variant);
  }
}
