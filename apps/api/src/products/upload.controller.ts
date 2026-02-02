import {
  Controller,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MinioService } from '../services/minio.service';
import { Product, ProductImage } from '../entities/product.entity';

@Controller('products')
export class UploadController {
  constructor(
    private readonly minioService: MinioService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
  ) {}

  /**
   * POST /products/:productId/images
   * Upload one or more images for a product
   * Body: { isDefault?: boolean } (optional - mark first image as default)
   */
  @Post(':productId/images')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(
    @Param('productId') productId: string,
    @UploadedFile() file: any,
    @Body() body: { isDefault?: string; altText?: string },
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file is an image
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    // Check product exists
    const product = await this.productRepository.findOne({
      where: { id: productId } as any,
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    // Upload file to MinIO under per-product prefix
    const { url, fileName } = await this.minioService.uploadFile(
      file,
      'country-natural-foods',
      `products/${productId}`,
    );

    // Create image record
    const productImage = this.imageRepository.create({
      productId,
      imageUrl: url,
      fileName,
      altText: body.altText || product.name,
    });

    await this.imageRepository.save(productImage);

    return {
      id: productImage.id,
      imageUrl: url,
      fileName,
      altText: productImage.altText,
    };
  }

  /**
   * PATCH /products/:productId/images/:imageId/set-default
   * Deprecated: Hero-card images are now used as default
   */
  @Post(':productId/images/:imageId/set-default')
  async setDefaultImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return { message: 'Hero-card images are now used as default' };
  }

  /**
   * DELETE /products/:productId/images/:imageId
   * Delete an image
   */
  @Post(':productId/images/:imageId/delete')
  async deleteImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    const image = await this.imageRepository.findOne({
      where: { id: imageId, productId } as any,
    });

    if (!image) {
      throw new BadRequestException('Image not found for this product');
    }

    // Delete from MinIO
    try {
      await this.minioService.deleteFile(image.fileName, 'country-natural-foods');
    } catch (error: any) {
      console.warn('Failed to delete file from MinIO:', error?.message);
      // Continue with DB deletion even if MinIO fails
    }

    // Delete from database
    await this.imageRepository.delete(imageId);

    return { message: 'Image deleted successfully' };
  }

  /**
   * PATCH /products/:productId/images/:imageId/replace
   * Replace an existing image with a new file (keeps order and default flag)
   */
  @Patch(':productId/images/:imageId/replace')
  @UseInterceptors(FileInterceptor('file'))
  async replaceImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    const image = await this.imageRepository.findOne({ where: { id: imageId, productId } as any });
    if (!image) {
      throw new BadRequestException('Image not found for this product');
    }

    // Upload new image under per-product prefix
    const { url, fileName } = await this.minioService.uploadFile(
      file,
      'country-natural-foods',
      `products/${productId}`,
    );

    // Delete previous file
    try {
      if (image.fileName) {
        await this.minioService.deleteFile(image.fileName, 'country-natural-foods');
      }
    } catch (err) {
      console.warn('Failed to delete previous product image:', err?.message || err);
    }

    // Update record
    image.imageUrl = url;
    image.fileName = fileName;
    await this.imageRepository.save(image);

    return { message: 'Image replaced successfully', image };
  }
}
