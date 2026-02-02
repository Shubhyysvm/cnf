import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminCategoriesService } from './admin-categories.service';
import { MinioService } from '../services/minio.service';

@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(
    private readonly adminCategoriesService: AdminCategoriesService,
    private readonly minioService: MinioService,
  ) {}

  @Get()
  async getAll() {
    return this.adminCategoriesService.findAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.adminCategoriesService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: any) {
    return this.adminCategoriesService.create(createDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.adminCategoriesService.update(id, updateDto);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    const category = await this.adminCategoriesService.findOne(id);
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    // Delete previous image if exists
    if (category.imageUrl) {
      try {
        const { bucket, objectName } = this.parseUrl(category.imageUrl);
        await this.minioService.deleteFile(objectName, bucket);
      } catch (err) {
        console.warn('Failed to delete previous category image:', err?.message || err);
      }
    }

    const safeSlug = category.slug?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || id;
    const { url, fileName } = await this.minioService.uploadFile(
      file,
      'country-natural-foods',
      `categories/${safeSlug}`,
    );

    await this.adminCategoriesService.update(id, { imageUrl: url });

    return {
      imageUrl: url,
      fileName,
      bucket: 'country-natural-foods',
    };
  }

  @Delete(':id/image')
  async deleteImage(
    @Param('id') id: string,
    @Query('fileName') fileName?: string,
  ) {
    const category = await this.adminCategoriesService.findOne(id);
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    // Attempt to infer bucket + object key
    try {
      const { bucket, objectName } = fileName
        ? { bucket: 'country-natural-foods', objectName: fileName }
        : category.imageUrl
        ? this.parseUrl(category.imageUrl)
        : { bucket: 'country-natural-foods', objectName: '' };

      if (objectName) {
        await this.minioService.deleteFile(objectName, bucket);
      }
    } catch (err) {
      console.error('Failed to delete category image from MinIO', err);
    }

    await this.adminCategoriesService.update(id, { imageUrl: undefined });

    return { message: 'Category image removed' };
  }

  @Get(':id/image/url')
  async getPresignedImageUrl(@Param('id') id: string) {
    const category = await this.adminCategoriesService.findOne(id);
    if (!category || !category.imageUrl) {
      throw new BadRequestException('No image found for category');
    }
    const { bucket, objectName } = this.parseUrl(category.imageUrl);
    const url = await this.minioService.getPresignedUrl(objectName, bucket);
    return { url };
  }

  private parseUrl(url: string): { bucket: string; objectName: string } {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    const bucket = parts[0];
    const objectName = parts.slice(1).join('/');
    return { bucket, objectName };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.adminCategoriesService.delete(id);
  }
}
