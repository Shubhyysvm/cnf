# Image System - Quick Reference

## 3 Simple Steps to Start

```
STEP 1: Install minio package
┌─────────────────────────────┐
│ Terminal 4:                 │
│ cd apps/api                 │
│ pnpm add minio              │
└─────────────────────────────┘

STEP 2: Restart API
┌─────────────────────────────┐
│ Terminal 2:                 │
│ Ctrl+C (stop API)           │
│ pnpm run start:dev (restart)│
└─────────────────────────────┘

STEP 3: Upload Images
┌─────────────────────────────┐
│ Use Postman:                │
│ POST /products/:id/images   │
│ Upload file + set default   │
└─────────────────────────────┘
```

---

## Image Flow (How It Works)

```
📸 Image in Downloads
        ↓
  Postman Form
        ↓
  MinIO Storage ←→ Database Record
  (localhost:9000)  (ProductImage)
        ↓
  Public URL
        ↓
  Mobile/Web App Display
```

---

## Database Structure

```
Product (1) ──── (Many) ProductImage
  id                    id
  name                  imageUrl ← URL from MinIO
  slug                  isDefault ← TRUE/FALSE
  ...                   displayOrder ← 0, 1, 2, ...
                        altText
                        fileName
```

---

## What Gets Stored

```
MinIO (Docker Container):
  /products/
    ├── 1702959203564-a1b2c3d4.jpg
    ├── 1702959204789-e5f6g7h8.png
    └── 1702959205912-i9j0k1l2.jpg

Database (PostgreSQL):
  product_images table
  ├── id: uuid
  ├── productId: uuid → links to Product
  ├── imageUrl: "http://localhost:9000/products/1702959203564-a1b2c3d4.jpg"
  ├── isDefault: true (shown on cards)
  ├── displayOrder: 0 (first in gallery)
  └── altText: "Product Description"
```

---

## API Endpoints

```
Upload Image:
  POST /products/{productId}/images
  Body: file, isDefault?, altText?
  Response: { id, imageUrl, displayOrder, isDefault }

Set Default:
  POST /products/{productId}/images/{imageId}/set-default
  Response: { message, image }

Delete Image:
  POST /products/{productId}/images/{imageId}/delete
  Response: { message }
```

---

## Example: Upload Coconut Oil Image

```
Postman Request:
┌─────────────────────────────────────────────┐
│ POST http://localhost:3001/products/        │
│         a1b2c3d4-e5f6-g7h8-i9j0/images      │
├─────────────────────────────────────────────┤
│ Body (form-data):                           │
│ • file: @coconut-oil-500ml.jpg              │
│ • isDefault: true                           │
│ • altText: Coconut Oil 500ml Cold Pressed   │
└─────────────────────────────────────────────┘

Response:
┌─────────────────────────────────────────────┐
│ {                                           │
│   "id": "img-uuid-1234",                    │
│   "imageUrl": "http://localhost:9000/       │
│                products/1702-abc123.jpg",   │
│   "displayOrder": 0,                        │
│   "isDefault": true,                        │
│   "altText": "Coconut Oil 500ml..."         │
│ }                                           │
└─────────────────────────────────────────────┘
```

---

## File Organization on Your Local Machine

```
Your Downloads Folder:
  ├── coconut-oil-500ml.jpg
  ├── coconut-oil-1000ml.jpg
  ├── groundnut-oil-500ml.jpg
  ├── groundnut-oil-1000ml.jpg
  └── [all other product images]

Map to Products:
  - Product: Coconut Oil
    Images: coconut-oil-*.jpg
    
  - Product: Groundnut Oil
    Images: groundnut-oil-*.jpg
```

---

## Mobile App Display

```
Homepage / Category Listing:
┌──────────────────┐
│   [IMAGE HERE]   │  ← isDefault image shown
│  Coconut Oil     │
│  ₹800            │
└──────────────────┘

Product Detail Page:
┌──────────────────┐
│  [IMAGE 1]   ◄► │  ← Scrollable gallery
│  (isDefault)     │
│  [DOTS: •●○○○]   │  ← Page indicators
└──────────────────┘
```

---

## Common Image Naming Pattern

```
Format: {product-name}_{variant}.jpg

Examples:
  coconut-oil_500ml.jpg
  coconut-oil_1000ml.jpg
  groundnut-oil_500ml.jpg
  groundnut-oil_1000ml.jpg
  turmeric-soap_100g.jpg
  turmeric-soap_200g_pack2.jpg
  almond-butter_250g.jpg
  almond-butter_500g.jpg
  almond-butter_1kg.jpg
```

---

## Status Check

```
✅ Backend Ready:
   - ProductImage entity (with isDefault)
   - MinIO service (upload handler)
   - Upload controller (API endpoints)
   - Database schema (ready for images)

⏳ Next Steps:
   1. pnpm add minio
   2. Restart API
   3. Upload images using Postman
   4. Update frontend to display (coming next)
```

---
