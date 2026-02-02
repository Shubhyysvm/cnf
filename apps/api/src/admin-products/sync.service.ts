import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImage, Product, ProductVariant } from '../entities/product.entity';
import { MinioService } from '../services/minio.service';

export interface SyncResult {
  productId: string;
  variantId?: string;
  orphanedFiles: string[]; // Files in MinIO but not in DB
  missingFiles: string[]; // Files in DB but not in MinIO
  syncedFiles: string[];
  errors: string[];
}

export interface SyncSummary {
  totalProducts: number;
  totalImages: number;
  orphanedFiles: number;
  missingFiles: number;
  syncedFiles: number;
  errors: number;
  results: SyncResult[];
}

@Injectable()
export class ProductImageSyncService {
  private readonly logger = new Logger(ProductImageSyncService.name);

  constructor(
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    private readonly minioService: MinioService,
  ) {}

  /**
   * Check sync status for a specific product
   */
  async checkProductSync(productId: string): Promise<SyncResult> {
    const result: SyncResult = {
      productId,
      orphanedFiles: [],
      missingFiles: [],
      syncedFiles: [],
      errors: [],
    };

    try {
      // Get all images from database for this product
      const dbImages = await this.imageRepository.find({
        where: { productId },
      });

      // Get all files from MinIO for this product
      const minioFiles = await this.listMinioFilesForProduct(productId);

      // Check for orphaned files (in MinIO but not in DB)
      for (const minioFile of minioFiles) {
        const existsInDb = dbImages.some((img) => img.fileName === minioFile);
        if (!existsInDb) {
          result.orphanedFiles.push(minioFile);
        } else {
          result.syncedFiles.push(minioFile);
        }
      }

      // Check for missing files (in DB but not in MinIO)
      for (const dbImage of dbImages) {
        const existsInMinio = minioFiles.includes(dbImage.fileName);
        if (!existsInMinio) {
          result.missingFiles.push(dbImage.fileName);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to check sync for product ${productId}:`, error);
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * Check sync status for all products
   */
  async checkAllProductsSync(): Promise<SyncSummary> {
    const summary: SyncSummary = {
      totalProducts: 0,
      totalImages: 0,
      orphanedFiles: 0,
      missingFiles: 0,
      syncedFiles: 0,
      errors: 0,
      results: [],
    };

    try {
      // Get all products
      const products = await this.productRepository.find({
        select: ['id'],
      });

      summary.totalProducts = products.length;

      // Check sync for each product
      for (const product of products) {
        const result = await this.checkProductSync(product.id);
        summary.results.push(result);
        summary.orphanedFiles += result.orphanedFiles.length;
        summary.missingFiles += result.missingFiles.length;
        summary.syncedFiles += result.syncedFiles.length;
        summary.errors += result.errors.length;
      }

      // Get total images from DB
      summary.totalImages = await this.imageRepository.count();
    } catch (error) {
      this.logger.error('Failed to check all products sync:', error);
    }

    return summary;
  }

  /**
   * Sync a specific product: remove orphaned files, recreate missing DB records
   */
  async syncProduct(productId: string, options: { 
    removeOrphaned: boolean; 
    recreateMissing: boolean;
  }): Promise<SyncResult> {
    const result = await this.checkProductSync(productId);

    try {
      const product = await this.productRepository.findOne({
        where: { id: productId },
        relations: ['category'],
      });

      if (!product) {
        result.errors.push('Product not found');
        return result;
      }

      // Remove orphaned files from MinIO
      if (options.removeOrphaned && result.orphanedFiles.length > 0) {
        for (const orphanedFile of result.orphanedFiles) {
          try {
            await this.minioService.deleteFile(orphanedFile, 'country-natural-foods');
            this.logger.log(`Deleted orphaned file: ${orphanedFile}`);
            result.orphanedFiles = result.orphanedFiles.filter((f) => f !== orphanedFile);
          } catch (error) {
            this.logger.error(`Failed to delete orphaned file ${orphanedFile}:`, error);
            result.errors.push(`Failed to delete ${orphanedFile}`);
          }
        }
      }

      // Recreate missing DB records from MinIO files
      if (options.recreateMissing && result.missingFiles.length > 0) {
        for (const missingFile of result.missingFiles) {
          try {
            // Extract variant info from file path
            const pathParts = missingFile.split('/');
            let variantWeight: string | undefined;
            let imageType: 'hero-card' | 'info-card' | 'other' = 'other';
            let variantId: string | undefined;

            // Parse path: products/{productId}/{variantWeight}/{imageType}/{filename}
            if (pathParts.length >= 4 && pathParts[0] === 'products') {
              variantWeight = pathParts[2];
              imageType = pathParts[3] as any;

              // Try to find variant by weight
              const variant = await this.variantRepository.findOne({
                where: { weight: variantWeight } as any,
              });
              variantId = variant?.id;
            }

            // Create DB record
            const imageUrl = await this.minioService.getFileUrl(missingFile, 'country-natural-foods');
            const newImage = this.imageRepository.create({
              productId,
              categoryId: product.category?.id,
              categoryName: product.category?.name,
              productName: product.name,
              variantId,
              variantWeight,
              imageType,
              imageUrl,
              fileName: missingFile,
              altText: pathParts[pathParts.length - 1], // Use filename as alt text
            });

            await this.imageRepository.save(newImage);
            this.logger.log(`Recreated DB record for missing file: ${missingFile}`);
            result.missingFiles = result.missingFiles.filter((f) => f !== missingFile);
            result.syncedFiles.push(missingFile);
          } catch (error) {
            this.logger.error(`Failed to recreate DB record for ${missingFile}:`, error);
            result.errors.push(`Failed to recreate ${missingFile}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to sync product ${productId}:`, error);
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * Sync all products
   */
  async syncAllProducts(options: {
    removeOrphaned: boolean;
    recreateMissing: boolean;
  }): Promise<SyncSummary> {
    const summary: SyncSummary = {
      totalProducts: 0,
      totalImages: 0,
      orphanedFiles: 0,
      missingFiles: 0,
      syncedFiles: 0,
      errors: 0,
      results: [],
    };

    try {
      const products = await this.productRepository.find({
        select: ['id'],
      });

      summary.totalProducts = products.length;

      for (const product of products) {
        const result = await this.syncProduct(product.id, options);
        summary.results.push(result);
        summary.orphanedFiles += result.orphanedFiles.length;
        summary.missingFiles += result.missingFiles.length;
        summary.syncedFiles += result.syncedFiles.length;
        summary.errors += result.errors.length;
      }

      summary.totalImages = await this.imageRepository.count();
    } catch (error) {
      this.logger.error('Failed to sync all products:', error);
    }

    return summary;
  }

  /**
   * Handle variant deletion: remove all associated images from MinIO and DB
   */
  async handleVariantDeletion(productId: string, variantId: string): Promise<void> {
    try {
      // Get all images for this variant
      const images = await this.imageRepository.find({
        where: { productId, variantId },
      });

      // Delete from MinIO
      for (const image of images) {
        try {
          await this.minioService.deleteFile(image.fileName, 'country-natural-foods');
          this.logger.log(`Deleted image file: ${image.fileName}`);
        } catch (error) {
          this.logger.error(`Failed to delete file ${image.fileName}:`, error);
        }
      }

      // Delete from DB
      await this.imageRepository.remove(images);
      this.logger.log(`Deleted ${images.length} images for variant ${variantId}`);
    } catch (error) {
      this.logger.error(`Failed to handle variant deletion:`, error);
      throw error;
    }
  }

  /**
   * Handle variant weight change: rename folders in MinIO and update DB
   */
  async handleVariantWeightChange(
    productId: string,
    variantId: string,
    oldWeight: string,
    newWeight: string,
  ): Promise<void> {
    try {
      // Get all images for this variant
      const images = await this.imageRepository.find({
        where: { productId, variantId },
      });

      // Update each image
      for (const image of images) {
        const oldPath = image.fileName;
        const newPath = oldPath.replace(`/${oldWeight}/`, `/${newWeight}/`);

        try {
          // Copy to new location
          await this.minioService.copyFile(
            oldPath,
            newPath,
            'country-natural-foods',
            'country-natural-foods',
          );

          // Delete old location
          await this.minioService.deleteFile(oldPath, 'country-natural-foods');

          // Update DB
          image.fileName = newPath;
          image.variantWeight = newWeight;
          image.imageUrl = await this.minioService.getFileUrl(newPath, 'country-natural-foods');
          await this.imageRepository.save(image);

          this.logger.log(`Renamed image path: ${oldPath} → ${newPath}`);
        } catch (error) {
          this.logger.error(`Failed to rename image ${oldPath}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Failed to handle variant weight change:', error);
      throw error;
    }
  }

  /**
   * List all MinIO files for a product
   */
  private async listMinioFilesForProduct(productId: string): Promise<string[]> {
    try {
      const prefix = `products/${productId}/`;
      const files = await this.minioService.listFiles('country-natural-foods', prefix);
      return files;
    } catch (error) {
      this.logger.error(`Failed to list MinIO files for product ${productId}:`, error);
      return [];
    }
  }
}
