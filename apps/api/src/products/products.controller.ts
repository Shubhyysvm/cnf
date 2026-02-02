import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ProductsService } from './products.service';
import { MinioService } from '../services/minio.service';
import type { Response } from 'express';

// Fallback 1x1 transparent PNG (base64) to guarantee a 200 even if the MinIO object is missing
const FALLBACK_IMAGE_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+n70sAAAAASUVORK5CYII=';
const FALLBACK_IMAGE_BUFFER = Buffer.from(FALLBACK_IMAGE_BASE64, 'base64');

// Helper function to transform product entity to frontend format
function transformProduct(product: any) {
  const transformed = {
    ...product,
    basePrice: product.price,
    averageRating: product.rating,
    totalReviews: product.reviewCount,
    imageUrl: product.images?.[0] || null,
    // Transform images to use presigned URLs
    images: product.images?.map((img: any) => ({
      ...img,
      // Convert direct MinIO URLs to API endpoint that generates presigned URLs
      imageUrl: img.imageUrl ? getPresignedImageUrl(img.imageUrl) : null,
    })) || [],
  };
  
  console.log('[transformProduct]', product.name, '- images count:', transformed.images.length);
  if (transformed.images.length > 0) {
    console.log('[transformProduct] First image URL:', transformed.images[0].imageUrl);
  }
  
  return transformed;
}

// Helper to convert MinIO URL to presigned URL endpoint
function getPresignedImageUrl(minioUrl: string | null | undefined): string | null {
  if (!minioUrl) return null;
  
  // Extract the file key from the MinIO URL
  // URL format: http://localhost:9000/country-natural-foods/{fileKey}
  // or http://172.20.10.3:9000/country-natural-foods/{fileKey}
  const match = minioUrl.match(/country-natural-foods\/(.+)$/);
  if (match && match[1]) {
    const fileKey = match[1];
    // Encode file key as base64 to preserve special characters in URL
    const encodedKey = Buffer.from(fileKey).toString('base64');
    return `/api/products/images/serve/${encodeURIComponent(encodedKey)}`;
  }
  
  // If it's not a MinIO URL, return as-is
  if (minioUrl.startsWith('http')) {
    return minioUrl;
  }
  
  return null;
}

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly minioService: MinioService,
  ) {}

  @Get()
  async getProducts(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: string,
    @Query('new') newest?: string,
    @Query('bestseller') bestseller?: string,
    @Query('sort') sort?: 'soldCount' | 'createdAt',
    @Query('limit') limit?: string,
    @Query('exclude') exclude?: string,
  ) {
    const products = await this.productsService.findAllProducts({
      category,
      search,
      featured: featured === 'true',
      newest: newest === 'true',
      bestseller: bestseller === 'true',
      sort,
      limit: limit ? parseInt(limit, 10) : undefined,
      excludeProductId: exclude,
    });
    return products.map(transformProduct);
  }

  @Get('images/serve/:fileKey')
  async serveImage(@Param('fileKey') fileKey: string, @Res() res: Response) {
    try {
      // fileKey is base64 encoded file path to avoid special character issues
      const decodedKey = decodeURIComponent(fileKey);
      const fileName = Buffer.from(decodedKey, 'base64').toString('utf-8');
      
      console.log('[serveImage] Serving:', fileName);
      
      // Check existence first to avoid stream errors later
      const exists = await this.minioService.fileExists(
        fileName,
        'country-natural-foods',
      );

      if (!exists) {
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=60');
        return res.status(200).send(FALLBACK_IMAGE_BUFFER);
      }

      // Stream image from MinIO through API (backend has MinIO credentials)
      // NOTE: getFileStream expects (fileName, bucketName)
      const stream = await this.minioService.getFileStream(fileName, 'country-natural-foods');

      // Best-effort content type based on extension; avoids extra stat call
      const ext = fileName.toLowerCase();
      if (ext.endsWith('.png')) res.setHeader('Content-Type', 'image/png');
      else if (ext.endsWith('.webp')) res.setHeader('Content-Type', 'image/webp');
      else if (ext.endsWith('.svg')) res.setHeader('Content-Type', 'image/svg+xml');
      else res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600');

      // If stream fails mid-flight, fall back to inline PNG once
      let responded = false;
      stream.on('error', (err: any) => {
        if (responded || res.headersSent) return;
        responded = true;
        console.error('[serveImage] Stream error:', err?.message || err);
        // Only set headers if not already sent
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=60');
          res.status(200).send(FALLBACK_IMAGE_BUFFER);
        }
      });

      stream.on('end', () => {
        responded = true;
      });

      return stream.pipe(res);
    } catch (error) {
      console.error('[serveImage] Error:', error);
      // Never return 404 to the client; return a tiny transparent PNG buffer with 200
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.status(200).send(FALLBACK_IMAGE_BUFFER);
    }
  }

  @Get(':slug')
  async getProductBySlug(@Param('slug') slug: string) {
    const product = await this.productsService.findProductBySlug(slug);
    return product ? transformProduct(product) : null;
  }
}

@Controller('categories')
export class CategoriesController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getCategories() {
    const categories = await this.productsService.findAllCategories();
    return categories.map((cat: any) => ({
      ...cat,
      // Return null for missing images; let frontend use default fallback
      imageUrl: cat.imageUrl ? getPresignedImageUrl(cat.imageUrl) : null,
    }));
  }

  @Get(':slug')
  async getCategoryBySlug(@Param('slug') slug: string) {
    const category = await this.productsService.findCategoryBySlug(slug);
    if (!category) return null;
    
    return {
      ...category,
      imageUrl: category.imageUrl ? getPresignedImageUrl(category.imageUrl) : null,
    };
  }
}

@Controller('products/search')
export class ProductSearchController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('autocomplete')
  async autocomplete(@Query('q') q: string, @Query('limit') limit?: string) {
    const n = limit ? parseInt(limit, 10) : 5;
    return this.productsService.autocomplete(q || '', n);
  }
}
