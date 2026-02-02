# MinIO Setup Guide for Image Uploads

## What is MinIO?
MinIO is an open-source object storage service compatible with Amazon S3. It's perfect for storing product images separately from your database.

## Quick Start (Using Docker)

### 1. Add MinIO to docker-compose.yml

```yaml
version: '3.8'

services:
  # ... existing services (postgres, api, etc)
  
  minio:
    image: minio/minio:latest
    container_name: minio_server
    ports:
      - "9000:9000"      # MinIO API
      - "9001:9001"      # MinIO Console (admin panel)
    environment:
      MINIO_ROOT_USER: minioadmin      # Default username
      MINIO_ROOT_PASSWORD: minioadmin  # Change this in production!
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

volumes:
  minio_data:
  # ... other volumes
```

### 2. Start MinIO

```bash
docker-compose up minio -d
```

### 3. Access MinIO Console

- URL: `http://localhost:9001`
- Username: `minioadmin`
- Password: `minioadmin`

### 4. Create a Bucket

1. Go to MinIO Console
2. Click "Create Bucket"
3. Name it: `products`
4. Keep default settings
5. Click "Create"

---

## Backend Integration (NestJS + TypeORM)

### Step 1: Install MinIO Client

```bash
npm install --save minio
# or
pnpm add minio
```

### Step 2: Create MinIO Service

Create `apps/api/src/services/minio.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });
  }

  async uploadFile(
    bucketName: string,
    file: Express.Multer.File,
    prefix: string = ''
  ): Promise<string> {
    const fileName = `${prefix}${uuidv4()}-${file.originalname}`;
    
    try {
      await this.minioClient.putObject(
        bucketName,
        fileName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        }
      );

      // Return presigned URL (valid for 24 hours)
      const url = await this.minioClient.presignedGetObject(
        bucketName,
        fileName,
        24 * 60 * 60 // 24 hours
      );

      return url;
    } catch (error) {
      throw new Error(`MinIO upload failed: ${error.message}`);
    }
  }

  async deleteFile(bucketName: string, fileName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(bucketName, fileName);
    } catch (error) {
      throw new Error(`MinIO delete failed: ${error.message}`);
    }
  }

  async getPublicUrl(bucketName: string, fileName: string): Promise<string> {
    // For public files, you can generate presigned URLs
    // Or use direct URL: http://localhost:9000/products/filename
    return `http://localhost:9000/${bucketName}/${fileName}`;
  }
}
```

### Step 3: Update Admin Products Service

```typescript
import { MinioService } from '../services/minio.service';

@Injectable()
export class AdminProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private imageRepository: Repository<ProductImage>,
    private minioService: MinioService, // Add this
  ) {}

  async uploadProductImage(
    productId: string,
    file: Express.Multer.File,
    altText?: string,
    displayOrder?: number
  ): Promise<ProductImage> {
    const product = await this.getProductById(productId);

    // Upload to MinIO
    const imageUrl = await this.minioService.uploadFile(
      'products',
      file,
      `${productId}/` // Organize by product ID
    );

    // Create database record
    const productImage = this.imageRepository.create({
      productId,
      imageUrl,
      fileName: file.originalname,
      altText: altText || file.originalname,
      displayOrder: displayOrder || 0,
      isDefault: false,
    });

    return await this.imageRepository.save(productImage);
  }

  async deleteProductImage(productId: string, imageId: string): Promise<{ message: string }> {
    const image = await this.imageRepository.findOne({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    // Delete from MinIO
    const fileName = image.imageUrl.split('/').pop();
    await this.minioService.deleteFile('products', fileName);

    // Delete from database
    await this.imageRepository.remove(image);

    return { message: 'Image deleted successfully' };
  }
}
```

### Step 4: Update Module

```typescript
// admin-products.module.ts
import { MinioService } from '../services/minio.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage, ProductVariant]),
  ],
  controllers: [AdminProductsController],
  providers: [AdminProductsService, MinioService],
})
export class AdminProductsModule {}
```

### Step 5: Add Environment Variables

Create `.env` file in `apps/api/`:

```env
# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

---

## Frontend Integration (Already Built!)

The edit page already has image upload UI. Update the API client:

### Add Image Upload to ProductClient

```typescript
// packages/admin-api-client/src/clients/ProductClient.ts

async uploadImage(
  productId: string,
  file: File,
  altText?: string
): Promise<AxiosResponse<ProductImage>> {
  const formData = new FormData();
  formData.append('file', file);
  if (altText) formData.append('altText', altText);

  return this.api.post(
    `/admin/products/${productId}/images`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
}

async deleteImage(
  productId: string,
  imageId: string
): Promise<AxiosResponse<{ message: string }>> {
  return this.api.delete(`/admin/products/${productId}/images/${imageId}`);
}
```

### Update Edit Page

```typescript
// Handle image upload with feedback
const uploadImages = async () => {
  const newImages = images.filter(img => img._isNew && img._file);
  if (newImages.length === 0) return;

  for (const img of newImages) {
    try {
      const response = await apiClient.products.uploadImage(
        id,
        img._file!,
        img.altText
      );
      toast.success(`✅ Image "${img.fileName}" uploaded!`);
    } catch (error) {
      toast.error(`❌ Failed to upload "${img.fileName}"`);
      console.error(error);
    }
  }
};

// Update handleSave to call uploadImages
const handleSave = async () => {
  setSaving(true);
  try {
    // Save product info
    await apiClient.products.update(id, form as any);
    toast.success("✅ Product updated!");
    
    // Upload images
    await uploadImages();
    
    setTimeout(() => router.push("/admin/products"), 1500);
  } catch (err) {
    toast.error("❌ Update failed");
    console.error(err);
  } finally {
    setSaving(false);
  }
};
```

---

## Production Setup

### 1. Use External MinIO / S3

Instead of Docker, use:
- **AWS S3**: Industry standard
- **Digital Ocean Spaces**: Cheaper alternative
- **Linode Object Storage**: Same S3 API
- **Backblaze B2**: Ultra-cheap storage

Just change environment variables to point to their endpoint.

### 2. Enable Public Bucket

For direct image access without presigned URLs:

```typescript
// In MinIO Console:
// 1. Go to Buckets > products
// 2. Click "Access Policy"
// 3. Select "Public"
// 4. Save
```

Then images are accessible at:
```
http://minio-url/products/filename.jpg
```

### 3. Add CDN / Cloudflare

For faster image delivery:
- Put Cloudflare in front of MinIO
- Enable image optimization
- Cache images globally

---

## Testing the Integration

### 1. Start services

```bash
docker-compose up -d postgres minio
cd apps/api && pnpm run start:dev
cd apps/admin-web && pnpm run dev
```

### 2. Go to edit product page

- Navigate to admin products
- Click Edit on any product
- Go to "Product Images" tab
- Upload an image
- See success toast
- Image should appear in grid

### 3. Check MinIO Console

- Go to `http://localhost:9001`
- Browse "products" bucket
- Should see uploaded images organized by product ID

---

## Cost Estimate

- **MinIO (self-hosted Docker)**: Free + server cost
- **AWS S3**: ~$0.023 per GB/month (cheap)
- **DigitalOcean Spaces**: $5/month (5GB) or $15/month (250GB)
- **Linode Object Storage**: $5/month

For a food e-commerce site with 1,000 products:
- Assume 3 images/product = 3,000 images
- Average image size = 100KB
- Total storage = ~300MB = $0.007/month on S3

**Basically free.**

---

## Troubleshooting

### "Cannot connect to MinIO"

```bash
# Check MinIO is running
docker ps | grep minio

# Check logs
docker logs minio_server

# Check endpoint in .env
# Should be 'localhost' for local, your domain for production
```

### "Bucket not found"

1. Go to MinIO Console
2. Create bucket named "products"
3. Make sure bucket exists

### "Images not showing"

1. Check image URL is accessible: `curl http://localhost:9000/products/filename.jpg`
2. Check presigned URL didn't expire (refresh browser)
3. Check CORS settings in MinIO

---

## Next Steps

1. ✅ Read this guide
2. 📋 Add MinIO to docker-compose.yml
3. 🚀 Start MinIO container
4. 📦 Install minio package
5. 🔧 Create MinioService
6. 🖼️ Update ProductImage upload method
7. 📝 Update frontend to call upload endpoint
8. ✨ Test end-to-end

---

## References

- MinIO Docs: https://min.io/docs
- MinIO + NestJS Example: https://github.com/minio/minio-js
- S3 API Compatibility: https://docs.min.io/docs/s3-api-overview.html
