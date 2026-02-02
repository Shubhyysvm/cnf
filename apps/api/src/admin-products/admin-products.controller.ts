import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminProductsService, PaginatedResponse, ProductFilters } from './admin-products.service';
import { ProductImageSyncService } from './sync.service';
import { Product } from '../entities/product.entity';

@Controller('admin/products')
export class AdminProductsController {
  constructor(
    private readonly adminProductsService: AdminProductsService,
    private readonly syncService: ProductImageSyncService,
  ) {}

  @Get()
  async getAll(@Query() filters: any): Promise<PaginatedResponse<Product>> {
    const parsedFilters: ProductFilters = {
      page: filters.page ? parseInt(filters.page, 10) : 1,
      pageSize: filters.pageSize ? parseInt(filters.pageSize, 10) : 20,
      search: filters.search,
      categoryId: filters.categoryId,
      isFeatured: filters.isFeatured !== undefined ? filters.isFeatured === 'true' : undefined,
      isBestSeller: filters.isBestSeller !== undefined ? filters.isBestSeller === 'true' : undefined,
      isActive: filters.isActive !== undefined ? filters.isActive === 'true' : undefined,
      sortBy: filters.sortBy || 'createdAt',
      order: (filters.order || 'DESC') as 'ASC' | 'DESC',
    };

    return await this.adminProductsService.getAllProducts(parsedFilters);
  }

  @Post('check-slug')
  async checkSlugAvailability(@Body() { slug }: { slug: string }) {
    return await this.adminProductsService.checkSlugAvailability(slug);
  }

  @Post()
  async create(@Body() createProductDto: any) {
    return await this.adminProductsService.createProduct(createProductDto);
  }

  @Post('bulk-delete')
  async bulkDelete(@Body() { ids }: { ids: string[] }) {
    return await this.adminProductsService.bulkDeleteProducts(ids);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.adminProductsService.getProductById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: any) {
    return await this.adminProductsService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.adminProductsService.deleteProduct(id);
  }

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') productId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { altText?: string }
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    return await this.adminProductsService.uploadProductImage(
      productId,
      file,
      body.altText
    );
  }

  @Post(':id/variants/:variantId/images/:imageType')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVariantImage(
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
    @Param('imageType') imageType: 'hero-card' | 'info-card' | 'other',
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { altText?: string; variantWeight?: string }
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    if (!['hero-card', 'info-card', 'other'].includes(imageType)) {
      throw new BadRequestException('Invalid image type');
    }

    return await this.adminProductsService.uploadProductImage(
      productId,
      file,
      body.altText,
      variantId,
      body.variantWeight,
      imageType
    );
  }

  @Delete(':id/images/:imageId')
  async deleteImage(@Param('id') productId: string, @Param('imageId') imageId: string) {
    return await this.adminProductsService.deleteProductImage(productId, imageId);
  }

  @Delete(':id/variants/:variantId/images/:imageType/:imageId')
  async deleteVariantImage(
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
    @Param('imageType') imageType: string,
    @Param('imageId') imageId: string
  ) {
    return await this.adminProductsService.deleteProductImage(productId, imageId);
  }

  @Post(':id/variants')
  async createVariant(@Param('id') productId: string, @Body() variantDto: any) {
    return await this.adminProductsService.createVariant(productId, variantDto);
  }

  @Patch(':id/variants/:variantId')
  async updateVariant(
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
    @Body() updateDto: any,
  ) {
    return await this.adminProductsService.updateVariant(productId, variantId, updateDto);
  }

  @Delete(':id/variants/:variantId')
  async deleteVariant(
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
  ) {
    return await this.adminProductsService.deleteVariant(productId, variantId);
  }

  // ========== SYNC ENDPOINTS ==========

  @Get(':id/images/sync/check')
  async checkProductImageSync(@Param('id') productId: string) {
    return await this.syncService.checkProductSync(productId);
  }

  @Post(':id/images/sync')
  async syncProductImages(
    @Param('id') productId: string,
    @Body() options: { removeOrphaned?: boolean; recreateMissing?: boolean }
  ) {
    return await this.syncService.syncProduct(productId, {
      removeOrphaned: options.removeOrphaned ?? true,
      recreateMissing: options.recreateMissing ?? true,
    });
  }

  @Get('sync/check-all')
  async checkAllProductsSync() {
    return await this.syncService.checkAllProductsSync();
  }

  @Post('sync/sync-all')
  async syncAllProducts(
    @Body() options: { removeOrphaned?: boolean; recreateMissing?: boolean }
  ) {
    return await this.syncService.syncAllProducts({
      removeOrphaned: options.removeOrphaned ?? true,
      recreateMissing: options.recreateMissing ?? true,
    });
  }
}
