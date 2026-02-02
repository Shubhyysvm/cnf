import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere, DeepPartial } from 'typeorm';
import { Product, ProductImage, ProductVariant } from '../entities/product.entity';
import { MinioService } from '../services/minio.service';

export interface ProductFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'soldCount';
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class AdminProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    private minioService: MinioService,
  ) {}

  async getAllProducts(filters: ProductFilters): Promise<any> {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // Build base query
    let query = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    console.log('[AdminProductsService] getAllProducts called with filters:', JSON.stringify(filters));

    // Apply search filter
    if (filters.search) {
      query = query.where('product.name ILIKE :search', { search: `%${filters.search}%` });
    }

    // Apply category filter
    if (filters.categoryId) {
      query = query.andWhere('product.categoryId = :categoryId', { categoryId: filters.categoryId });
    }

    // Apply featured filter
    if (filters.isFeatured !== undefined) {
      query = query.andWhere('product.isFeatured = :isFeatured', { isFeatured: filters.isFeatured });
    }

    // Apply best seller filter
    if (filters.isBestSeller !== undefined) {
      query = query.andWhere('product.isBestSeller = :isBestSeller', { isBestSeller: filters.isBestSeller });
    }

    // Apply active filter
    if (filters.isActive !== undefined) {
      query = query.andWhere('product.isActive = :isActive', { isActive: filters.isActive });
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'createdAt';
    const order = filters.order || 'DESC';
    query = query.orderBy(`product.${sortBy}`, order as 'ASC' | 'DESC');

    // Get total count first (before pagination)
    const total = await query.getCount();

    console.log('[AdminProductsService] Query count before pagination:', total);
    console.log('[AdminProductsService] Query SQL:', query.getSql());

    // Apply pagination
    query = query.skip(skip).take(pageSize);

    // Get products
    const products = await query.getMany();

    // Load variant counts separately for each product
    const productIds = products.map(p => p.id);
    if (productIds.length > 0) {
      const variantCounts = await this.productsRepository
        .createQueryBuilder('product')
        .select('product.id', 'productId')
        .addSelect('COUNT(variant.id)', 'count')
        .leftJoin('product.variants', 'variant')
        .where('product.id IN (:...ids)', { ids: productIds })
        .groupBy('product.id')
        .getRawMany();

      const countMap = new Map(variantCounts.map(v => [v.productId, parseInt(v.count)]));
      products.forEach(p => {
        (p as any).variantCount = countMap.get(p.id) || 0;
      });
    }

    return {
      data: products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category', 'images', 'variants', 'certifications'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async createProduct(createProductDto: any): Promise<Product> {
    // Validate required fields
    if (!createProductDto.name || !createProductDto.slug || !createProductDto.price) {
      throw new BadRequestException('Missing required fields: name, slug, price');
    }

    // Normalize slug
    const normalizedSlug = this.normalizeSlug(createProductDto.slug);
    createProductDto.slug = normalizedSlug;

    // Check for duplicate slug - always fail if duplicate (frontend has already validated via checkSlugAvailability)
    const existingProduct = await this.productsRepository.findOne({ where: { slug: normalizedSlug } });
    if (existingProduct) {
      throw new BadRequestException(`Product with slug "${normalizedSlug}" already exists. Please choose a different slug.`);
    }

    const { images, variants, autoAdjustSlug, ...productData } = createProductDto;

    // If categoryId provided, fetch category name
    if (productData.categoryId) {
      const category = await this.productsRepository
        .query('SELECT name FROM categories WHERE id = $1', [productData.categoryId])
        .then((result) => result[0]);
      if (category) {
        productData.categoryName = category.name;
      }
      // Set relation rather than raw ID (TypeORM typed)
      (productData as any).category = { id: productData.categoryId };
      delete (productData as any).categoryId;
    }

    const product = this.productsRepository.create(productData as any);

    return (await this.productsRepository.save(product)) as unknown as Product;
  }

  /**
   * Generate a unique slug by appending an incrementing numeric suffix.
   */
  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let counter = 2;
    let candidate = baseSlug;

    while (await this.productsRepository.findOne({ where: { slug: candidate } })) {
      candidate = `${baseSlug}-${counter}`;
      counter += 1;
    }
    return candidate;
  }

  /**
   * Normalize slug: lowercase, trim, replace non-alphanumerics with '-', collapse dashes, trim edges.
   */
  private normalizeSlug(raw: string): string {
    if (!raw) return 'product';
    const cleaned = raw
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    return cleaned || 'product';
  }

  /**
   * Check if a slug is available and suggest alternatives if not.
   * Called in real-time as user types product name to avoid UX confusion.
   */
  async checkSlugAvailability(slug: string): Promise<{ available: boolean; normalizedSlug: string; suggestion?: string }> {
    const normalizedSlug = this.normalizeSlug(slug);
    const existingProduct = await this.productsRepository.findOne({ where: { slug: normalizedSlug } });

    if (!existingProduct) {
      // Slug is available
      return {
        available: true,
        normalizedSlug,
      };
    }

    // Slug is taken, generate a suggestion
    const suggestion = await this.generateUniqueSlug(normalizedSlug);
    return {
      available: false,
      normalizedSlug,
      suggestion,
    };
  }

  async updateProduct(id: string, updateProductDto: any): Promise<Product> {
    const product = await this.getProductById(id);

    // If updating slug, check for duplicates
    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const existingProduct = await this.productsRepository.findOne({
        where: { slug: updateProductDto.slug },
      });

      if (existingProduct) {
        throw new BadRequestException(`Product with slug "${updateProductDto.slug}" already exists`);
      }
    }

    // If categoryId provided, fetch and set category name
    if (updateProductDto.categoryId) {
      const category = await this.productsRepository
        .query('SELECT name FROM categories WHERE id = $1', [updateProductDto.categoryId])
        .then((result) => result[0]);
      if (category) {
        updateProductDto.categoryName = category.name;
      }
      // Assign relation properly
      (product as any).category = { id: updateProductDto.categoryId };
      delete updateProductDto.categoryId;
    }

    Object.assign(product, updateProductDto);
    return (await this.productsRepository.save(product)) as unknown as Product;
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const product = await this.getProductById(id);
    await this.productsRepository.remove(product);
    return { message: `Product ${id} deleted successfully` };
  }

  async bulkDeleteProducts(ids: string[]): Promise<{ deletedCount: number }> {
    const result = await this.productsRepository.delete(ids);
    return { deletedCount: result.affected || 0 };
  }

  async uploadProductImage(
    productId: string,
    file: Express.Multer.File,
    altText?: string,
    variantId?: string,
    variantWeight?: string,
    imageType: 'hero-card' | 'info-card' | 'other' = 'other'
  ): Promise<ProductImage> {
    // Verify product exists
    const product = await this.getProductById(productId);

    try {
      // Resolve variant weight if not provided
      if (variantId && (!variantWeight || variantWeight.trim() === '')) {
        const variant = await this.productVariantRepository.findOne({
          where: { id: variantId, product: { id: productId } },
        });
        if (!variant) {
          throw new BadRequestException('Invalid variant for this product');
        }
        variantWeight = variant.weight;
      }

      // Build MinIO folder path
      let folderPath = `products/${productId}`;
      if (variantWeight) {
        folderPath = `${folderPath}/${variantWeight}/${imageType}`;
      }

      // Upload to MinIO (bucket + prefix)
      const uploadResult = await this.minioService.uploadFile(
        file,
        'country-natural-foods',
        folderPath
      );

      // For hero-card and info-card, auto-replace any existing image of that type
      if (variantId && (imageType === 'hero-card' || imageType === 'info-card')) {
        const existingImage = await this.productImageRepository.findOne({
          where: { productId, variantId, imageType },
        });
        if (existingImage) {
          // Delete old image from MinIO and DB
          try {
            await this.minioService.deleteFile(existingImage.fileName, 'country-natural-foods');
          } catch (error) {
            console.warn('Failed to delete old image from MinIO:', error);
          }
          await this.productImageRepository.remove(existingImage);
        }
      }

      // Create image record in database
      const productImage = this.productImageRepository.create({
        productId,
        categoryId: product.category?.id,
        categoryName: product.category?.name,
        variantId,
        variantWeight,
        imageType,
        imageUrl: uploadResult.url,
        fileName: uploadResult.fileName,
        altText: altText || file.originalname,
        productName: product.name,
      });

      return await this.productImageRepository.save(productImage);
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  async createVariant(productId: string, variantDto: Partial<ProductVariant>): Promise<ProductVariant> {
    const product = await this.getProductById(productId);

    const variantData: any = {
      ...variantDto,
      categoryId: product.category?.id,
      categoryName: product.category?.name,
    };

    const variant = this.productVariantRepository.create(variantData);
    // Set relation for product
    (variant as any).product = { id: productId };
    const saved = await this.productVariantRepository.save(variant);
    
    return saved as unknown as ProductVariant;
  }

  async updateVariant(
    productId: string,
    variantId: string,
    updateDto: Partial<ProductVariant>
  ): Promise<ProductVariant> {
    // Ensure product exists
    await this.getProductById(productId);

    // Find the variant
    const variant = await this.productVariantRepository.findOne({
      where: { id: variantId, product: { id: productId } },
    });

    if (!variant) {
      throw new NotFoundException(`Variant ${variantId} not found for product ${productId}`);
    }

    // If toggling default, ensure exclusivity per product
    if (updateDto.isDefault === true) {
      await this.productVariantRepository.update(
        { product: { id: productId } },
        { isDefault: false }
      );
    }

    // Preserve category linkage based on product
    if (updateDto.categoryId || updateDto.categoryName) {
      // Allow explicit override, else keep existing linkage
    } else {
      const product = await this.productsRepository.findOne({ where: { id: productId }, relations: ['category'] });
      if (product) {
        updateDto.categoryId = product.category?.id;
        updateDto.categoryName = product.category?.name;
      }
    }

    Object.assign(variant, updateDto);
    const saved = await this.productVariantRepository.save(variant);
    return saved as unknown as ProductVariant;
  }

  async deleteVariant(productId: string, variantId: string): Promise<{ message: string }> {
    // Ensure product exists
    await this.getProductById(productId);

    const variant = await this.productVariantRepository.findOne({
      where: { id: variantId, product: { id: productId } },
    });

    if (!variant) {
      throw new NotFoundException(`Variant ${variantId} not found for product ${productId}`);
    }

    await this.productVariantRepository.remove(variant);
    return { message: `Variant ${variantId} deleted successfully` };
  }

  async deleteProductImage(productId: string, imageId: string): Promise<{ message: string }> {
    // Verify product exists
    await this.getProductById(productId);

    // Find the image record
    const image = await this.productImageRepository.findOne({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found for product ${productId}`);
    }

    try {
      // Delete from MinIO
      await this.minioService.deleteFile(image.fileName, 'country-natural-foods');

      // Delete from database
      await this.productImageRepository.remove(image);

      return { message: `Image ${imageId} deleted successfully` };
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw new BadRequestException(`Failed to delete image: ${error.message}`);
    }
  }
}
