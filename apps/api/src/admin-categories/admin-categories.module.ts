import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminCategoriesController } from './admin-categories.controller';
import { AdminCategoriesService } from './admin-categories.service';
import { Category } from '../entities/product.entity';
import { MinioService } from '../services/minio.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [AdminCategoriesController],
  providers: [AdminCategoriesService, MinioService],
  exports: [AdminCategoriesService],
})
export class AdminCategoriesModule {}
