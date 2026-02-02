import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage, ProductVariant, Category, Certification } from '../entities/product.entity';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { ProductImageSyncService } from './sync.service';
import { MinioService } from '../services/minio.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductImage,
      ProductVariant,
      Category,
      Certification,
    ]),
  ],
  controllers: [AdminProductsController],
  providers: [AdminProductsService, ProductImageSyncService, MinioService],
  exports: [AdminProductsService, ProductImageSyncService],
})
export class AdminProductsModule {}
