import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductsController, CategoriesController, ProductSearchController } from './products.controller';
import { UploadController } from './upload.controller';
import { ProductsService } from './products.service';
import { ProductRepository } from './product.repository';
import { MinioService } from '../services/minio.service';
import {
  Product,
  ProductVariant,
  Category,
  Certification,
  ProductImage,
} from '../entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductVariant, Category, Certification, ProductImage]),
    MulterModule.register({
      storage: memoryStorage(),
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(new Error('Only image files are allowed'), false);
        } else {
          callback(null, true);
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    }),
  ],
  controllers: [ProductsController, CategoriesController, ProductSearchController, UploadController],
  providers: [ProductsService, ProductRepository, MinioService],
  exports: [ProductsService, ProductRepository, MinioService],
})
export class ProductsModule {}
