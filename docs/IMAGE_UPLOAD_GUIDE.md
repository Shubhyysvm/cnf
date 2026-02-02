# Image Upload & Management Guide

## Overview
Your Country Natural Foods store now supports unlimited images per product with a **default/featured image** system:
- **Default Image**: Shown on homepage, category pages, and product listings
- **Additional Images**: Full gallery for product detail pages (scrollable, like real e-commerce sites)

---

## Architecture

### Backend
- **MinIO**: Local file storage (already in docker-compose)
- **ProductImage Entity**: Stores image metadata with `isDefault` flag
- **Upload API**: `/products/:productId/images` endpoint

### Frontend
- **Web**: Simple drag-drop upload form
- **Mobile**: Display default image on cards, full gallery on detail page

---

## Step-by-Step Setup

### 1. **Install MinIO Client Library**

Run this command in **Terminal 4 (ad-hoc commands)**:

```powershell
cd c:\xampp\htdocs\CountryNaturalFoods\apps\api
pnpm add minio
```

---

### 2. **Verify MinIO is Running**

Check that MinIO is accessible (it should be running from docker-compose):

```powershell
# Check if MinIO container is running
docker ps | findstr minio
```

Should output something like: `ts-minio ... ts-minio:latest`

---

### 3. **Test Upload Endpoint**

Once API restarts (after code changes), test the upload with a sample image:

```powershell
# Create test image (1x1 pixel transparent PNG)
$imagePath = "$env:USERPROFILE\Downloads\test.png"

# Or use an actual image from your downloads
# Upload using curl or Postman:
curl -X POST http://localhost:3001/products/[PRODUCT_ID]/images `
  -F "file=@$imagePath" `
  -F "isDefault=true" `
  -F "altText=Product photo"
```

**Note:** Replace `[PRODUCT_ID]` with an actual product UUID from the database.

---

## How to Upload Your Images

### **Scenario: Uploading images for all products from your Downloads folder**

Since you have images already downloaded, here's how to bulk upload them:

#### **Option A: Using a PowerShell Script (Automated)**

Create a file: `c:\xampp\htdocs\CountryNaturalFoods\upload-images.ps1`

```powershell
# Script to upload all images from Downloads folder to products

$downloadFolder = "$env:USERPROFILE\Downloads"
$apiBase = "http://localhost:3001"

# Get all image files
$images = Get-ChildItem -Path $downloadFolder -Include *.jpg, *.jpeg, *.png, *.webp -Recurse

# You'll need a mapping of image filenames to product IDs
# Example structure: "coconut-oil_500ml.jpg" => productId
$productMap = @{
  "coconut-oil_500ml.jpg" = "PRODUCT-UUID-HERE"
  "coconut-oil_1000ml.jpg" = "PRODUCT-UUID-HERE"
  # Add more mappings
}

foreach ($image in $images) {
  $productId = $productMap[$image.Name]
  
  if ($productId) {
    Write-Host "Uploading $($image.Name) to product $productId..."
    
    $form = @{
      file = Get-Item -Path $image.FullName
      isDefault = "false"
      altText = $image.BaseName -replace "_", " "
    }
    
    $response = curl -X POST "$apiBase/products/$productId/images" `
      -F "file=@$($image.FullName)" `
      -F "isDefault=false" `
      -F "altText=$($image.BaseName -replace '_', ' ')"
    
    Write-Host "Response: $response"
  }
}
```

#### **Option B: Using Postman (Manual - Better for testing)**

1. **Open Postman**
2. **Create new request:**
   - Method: `POST`
   - URL: `http://localhost:3001/products/[PRODUCT-UUID]/images`
   - Headers: None needed (Postman handles multipart)
   - Body tab → select `form-data`:
     - Key: `file`, Type: `File` → Select image from Downloads
     - Key: `isDefault`, Type: `text`, Value: `true` (for first image only)
     - Key: `altText`, Type: `text`, Value: `Coconut Oil 500ml`
3. **Click Send**
4. **Response should be:**
   ```json
   {
     "id": "uuid",
     "imageUrl": "http://localhost:9000/products/...",
     "fileName": "timestamp-uuid.jpg",
     "displayOrder": 0,
     "isDefault": true,
     "altText": "Coconut Oil 500ml"
   }
   ```

---

## Getting Product IDs

You need product UUIDs to upload images. Run this query in database:

```sql
SELECT id, name, slug FROM products LIMIT 20;
```

Or use this API endpoint:

```powershell
curl http://localhost:3001/products
```

---

## Setting a Default Image

### **For a new image:**
```powershell
curl -X POST http://localhost:3001/products/[PRODUCT-ID]/images `
  -F "file=@C:\Users\YourName\Downloads\image.jpg" `
  -F "isDefault=true"
```

### **For an existing image:**
```powershell
curl -X POST http://localhost:3001/products/[PRODUCT-ID]/images/[IMAGE-ID]/set-default
```

---

## Current API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/products/:productId/images` | POST | Upload new image(s) for a product |
| `/products/:productId/images/:imageId/set-default` | POST | Mark image as default |
| `/products/:productId/images/:imageId/delete` | POST | Delete an image |

---

## Next Steps (Frontend Display)

### **Mobile App** (`apps/mobile/components/ProductCard.tsx`)
- Already has image fallback logic
- Will show `isDefault` image once data is available

### **Web App** (needs update)
- Show default image on product listings
- Show all images in carousel on product detail page

---

## Troubleshooting

### **Upload fails with "File must be an image"**
- Ensure file is actually an image (.jpg, .png, .webp, .gif)
- Check file MIME type: `file.exe` won't work

### **"Product not found"**
- Verify product UUID exists in database
- Use correct UUID format (128-bit UUID string)

### **MinIO connection refused**
- Ensure Docker is running: `docker ps`
- Check MinIO is accessible: `curl http://localhost:9000`

### **Images not showing in app**
- Check image URLs are accessible: `curl http://localhost:9000/products/[FILENAME]`
- Verify `imageUrl` is being returned from API `/products` endpoint

---

## Summary of What We Built

✅ **ProductImage Entity** - Stores unlimited images per product with `isDefault` flag  
✅ **MinIO Service** - Handles file uploads to local storage  
✅ **Upload Controller** - API endpoints for image management  
✅ **Database Relationships** - Product → ProductImages (eager loaded)

**What you need to do:**
1. Install minio package (`pnpm add minio`)
2. Restart API server
3. Upload images using Postman or script
4. Update frontend to display images

---
