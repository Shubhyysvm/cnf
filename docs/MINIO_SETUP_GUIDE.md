# MinIO Image Storage Setup Guide

## 📦 MinIO Overview

MinIO is an S3-compatible object storage system running locally in Docker. We use it to store product images for Country Natural Foods Farm.

**Access Points:**
- **MinIO Console (Web UI)**: http://localhost:9001
- **MinIO API (S3-compatible)**: http://localhost:9000
- **Credentials**: 
  - Username: `countrynatural`
  - Password: `countrynatural123`

---

## 🚀 Quick Setup Steps

### Step 1: Access MinIO Console

1. Open browser: http://localhost:9001
2. Login with:
   - **Username**: `countrynatural`
   - **Password**: `countrynatural123`

### Step 2: Create Bucket

1. Click **"Buckets"** in left sidebar
2. Click **"Create Bucket"** button (top right)
3. Enter bucket name: `cnf-products`
4. Click **"Create Bucket"**

### Step 3: Set Bucket to Public (for easy access)

#### Option A: Via MinIO Client (Recommended - Already Done! ✅)

```powershell
# Configure MinIO client alias inside container
docker exec ts-minio mc alias set local http://localhost:9000 countrynatural countrynatural123

# Set bucket to public read access
docker exec ts-minio mc anonymous set download local/cnf-products
```

This makes all images publicly accessible without authentication.

#### Option B: Via Console UI (if available in your MinIO version)

1. Click on the `cnf-products` bucket
2. Look for **"Access Policy"** or **"Summary"** tab
3. Set policy to **"Public"** or **"Download"**

**Note**: MinIO Community Edition may not have the "Anonymous" tab in the web UI. Use the CLI method above instead.

### Step 4: Upload Product Images

#### Option A: Manual Upload via Web UI

1. Click **"Object Browser"** in left sidebar
2. Select `cnf-products` bucket
3. Click **"Upload"** button
4. Select your product images
5. Click **"Upload"**

**Naming Convention:**
- Use descriptive names: `groundnut-oil-500ml.jpg`, `coconut-oil-1000ml.jpg`
- Use lowercase with hyphens
- Include product name and variant size in filename

#### Option B: Upload via MinIO Client (mc)

```powershell
# Install MinIO Client
choco install minio-client

# Configure alias
mc alias set local http://localhost:9000 countrynatural countrynatural123

# Upload entire folder
mc cp --recursive ./product-images/ local/cnf-products/

# Upload single file
mc cp groundnut-oil-500ml.jpg local/cnf-products/oils/
```

### Step 5: Get Image URLs

After uploading, your images will be accessible at:
```
http://localhost:9000/cnf-products/[filename]
```

Examples:
- `http://localhost:9000/cnf-products/groundnut-oil-500ml.jpg`
- `http://localhost:9000/cnf-products/oils/coconut-oil-1000ml.jpg`

---

## 🔄 Update Seed Data with Real Images

### Step 1: Create Image URL Mapping

Create a file `apps/api/src/database/image-urls.ts`:

```typescript
export const productImages = {
  'groundnut-oil': [
    'http://localhost:9000/cnf-products/oils/groundnut-oil-main.jpg',
    'http://localhost:9000/cnf-products/oils/groundnut-oil-closeup.jpg',
  ],
  'coconut-oil': [
    'http://localhost:9000/cnf-products/oils/coconut-oil-main.jpg',
  ],
  // ... add more products
};
```

### Step 2: Update seed-cnf.ts

Replace Unsplash URLs with MinIO URLs:

```typescript
import { productImages } from './image-urls';

// In your products array:
{ 
  name: 'Groundnut Oil', 
  slug: 'groundnut-oil',
  images: productImages['groundnut-oil'],  // Use real images
  // ... rest of product data
}
```

### Step 3: Re-run Seed

```powershell
cd apps/api
pnpm seed
```

---

## 🌐 Production Setup

For production deployment, you'll need to:

### Option 1: Keep MinIO (Self-Hosted)

1. Deploy MinIO to your server/cloud
2. Update URLs from `localhost:9000` to `your-domain.com`
3. Set up SSL certificate for HTTPS
4. Configure CloudFlare CDN in front of MinIO

### Option 2: Switch to Cloud Storage

**AWS S3:**
```typescript
// Update image URLs
const baseUrl = 'https://your-bucket.s3.amazonaws.com';
images: [`${baseUrl}/products/groundnut-oil-500ml.jpg`]
```

**Cloudinary:**
```typescript
const baseUrl = 'https://res.cloudinary.com/your-account/image/upload';
images: [`${baseUrl}/v1234567890/products/groundnut-oil-500ml.jpg`]
```

### Option 3: Hybrid (Recommended)

1. Use MinIO for development/staging
2. Use Cloudinary/S3 for production
3. Use environment variables:

```typescript
// config/storage.config.ts
export const storageConfig = {
  baseUrl: process.env.NODE_ENV === 'production'
    ? 'https://cdn.countrynatural.com'
    : 'http://localhost:9000/cnf-products'
};
```

---

## 📸 Image Optimization Tips

### Recommended Image Specs:

**Product Main Images:**
- Format: JPEG or WebP
- Size: 1200x1200px (square)
- Quality: 85%
- File size: < 200KB

**Product Thumbnails:**
- Size: 400x400px
- Quality: 80%
- File size: < 50KB

**Category Images:**
- Size: 800x600px (landscape)
- Quality: 85%
- File size: < 150KB

### Batch Optimization (ImageMagick)

```powershell
# Install ImageMagick
choco install imagemagick

# Convert to optimized JPEG
magick convert input.jpg -resize 1200x1200 -quality 85 output.jpg

# Batch process all images in folder
Get-ChildItem *.jpg | ForEach-Object {
  magick convert $_.FullName -resize 1200x1200 -quality 85 "optimized/$($_.Name)"
}
```

---

## 🔒 Security Best Practices

### Development (Current Setup)
- ✅ Public read access for easy development
- ⚠️ No authentication required for images
- ⚠️ Exposed on localhost only

### Production Requirements
- 🔐 Enable HTTPS/SSL
- 🔐 Use CDN (CloudFlare) for caching and DDoS protection
- 🔐 Set proper CORS headers
- 🔐 Use signed URLs for admin uploads
- 🔐 Implement rate limiting

---

## 🛠️ Useful MinIO Commands

### Check bucket contents:
```powershell
docker exec ts-minio mc ls local/cnf-products
```

### Check bucket access policy:
```powershell
docker exec ts-minio mc anonymous get local/cnf-products
```

### Copy files:
```powershell
# Local to MinIO
docker exec -i ts-minio mc cp /data/product-image.jpg local/cnf-products/

# Or copy from host to container, then to MinIO bucket
docker cp product-image.jpg ts-minio:/tmp/
docker exec ts-minio mc cp /tmp/product-image.jpg local/cnf-products/

# MinIO to MinIO
docker exec ts-minio mc cp local/cnf-products/old-name.jpg local/cnf-products/new-name.jpg

# MinIO to local
docker exec ts-minio mc cp local/cnf-products/image.jpg /data/
docker cp ts-minio:/data/image.jpg ./downloads/
```

### Delete files:
```powershell
docker exec ts-minio mc rm local/cnf-products/unwanted-image.jpg
```

### Mirror entire directory:
```powershell
# Copy folder to container first
docker cp ./local-images/ ts-minio:/tmp/images/
# Then mirror to bucket
docker exec ts-minio mc mirror /tmp/images/ local/cnf-products/
```

---

## 📝 Next Steps

1. ✅ MinIO is running
2. ✅ Access MinIO Console (http://localhost:9001)
3. ✅ Create `cnf-products` bucket
4. ✅ Set bucket to public/readonly (via CLI)
5. ⬜ Upload product images
6. ⬜ Create `image-urls.ts` mapping file
7. ⬜ Update `seed-cnf.ts` to use real images
8. ⬜ Run `pnpm seed` to update database
9. ⬜ Verify images load on web/mobile apps

---

## 🆘 Troubleshooting

### Can't access MinIO Console
- Verify container is running: `docker ps | grep minio`
- Check logs: `docker logs ts-minio`
- Restart: `docker restart ts-minio`

### Images not loading
- Verify bucket is public (Anonymous access enabled)
- Check URL format: `http://localhost:9000/cnf-products/[filename]`
- Check CORS if accessing from web app

### Upload fails
- Check available disk space
- Verify file size is reasonable (< 5MB per image)
- Check MinIO logs: `docker logs ts-minio`

---

## 📚 Additional Resources

- **MinIO Documentation**: https://min.io/docs/minio/linux/index.html
- **MinIO Client Guide**: https://min.io/docs/minio/linux/reference/minio-mc.html
- **S3 API Reference**: https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html
