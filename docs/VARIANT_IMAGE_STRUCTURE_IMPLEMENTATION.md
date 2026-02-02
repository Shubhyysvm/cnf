# Variant-Based Product Image Structure Implementation

## Status: PHASE 1 COMPLETE ✅

This document outlines the implementation of a variant-weight-based product image management system with organized folder hierarchy for hero, info, and other image types.

---

## What Was Implemented

### 1. **Database Schema Updates** ✅

#### Migration: `1734787200000-UpdateProductImagesForVariantStructure.ts`
**Status: EXECUTED**

Added three new columns to the `product_images` table:

```sql
ALTER TABLE "product_images" ADD "variantId" uuid;
ALTER TABLE "product_images" ADD "variantWeight" varchar;
ALTER TABLE "product_images" ADD "imageType" varchar NOT NULL DEFAULT 'other';
CREATE INDEX idx_product_images_variant_type ON product_images("variantId", "imageType");
```

#### ProductImage Entity Updates ✅

Updated [product.entity.ts](../apps/api/src/entities/product.entity.ts) with new fields:

```typescript
@Column({ type: 'uuid', nullable: true })
variantId: string; // Link to ProductVariant

@Column({ type: 'varchar', nullable: true })
variantWeight: string; // Denormalized (e.g., "500ml", "1kg")

@Column({ type: 'varchar', default: 'other' })
imageType: 'hero-card' | 'info-card' | 'other'; // Image categorization

@Column({ type: 'int', nullable: true })
displayOrder: number; // For "other" images only; null for hero-card/info-card

@Index(['variantId', 'imageType']) // Added index for efficient variant-image lookups
```

---

### 2. **Backend Service Updates** ✅

#### Admin Products Service: `uploadProductImage()` Method
**File**: [admin-products.service.ts](../apps/api/src/admin-products/admin-products.service.ts)

**Enhanced Features:**

1. **Variant-Scoped Uploads**: 
   - Accepts `variantId`, `variantWeight`, and `imageType` parameters
   - Routes uploads to `products/{productId}/{variantWeight}/{imageType}/` in MinIO

2. **Auto-Replace Logic for Hero/Info**:
   ```typescript
   if (variantId && (imageType === 'hero-card' || imageType === 'info-card')) {
     const existingImage = await this.productImageRepository.findOne({
       where: { productId, variantId, imageType },
     });
     if (existingImage) {
       // Auto-delete old image, upload new one
     }
   }
   ```

3. **Smart Default Image Logic**:
   - Only product-level images (without variantId) can be marked as default
   - Variant-specific images are never default

4. **Display Order Management**:
   - Only "other" image type uses displayOrder (for sorting)
   - Hero and info cards have displayOrder = null

---

### 3. **Controller Endpoints** ✅

#### Admin Products Controller
**File**: [admin-products.controller.ts](../apps/api/src/admin-products/admin-products.controller.ts)

**New Variant-Scoped Endpoints:**

```typescript
// Upload image for specific variant and image type
POST /admin/products/:id/variants/:variantId/images/:imageType
Body: { file, altText?, displayOrder?, variantWeight? }
Response: ProductImage

// Delete image from variant
DELETE /admin/products/:id/variants/:variantId/images/:imageType/:imageId
Response: { message: string }
```

**Updated Endpoints:**

- `POST /admin/products/:id/images` - Supports optional variantId/variantWeight/imageType params
- `DELETE /admin/products/:id/images/:imageId` - Works for all images

---

### 4. **Client Library Updates** ✅

#### ImageClient
**File**: [ImageClient.ts](../packages/admin-api-client/src/clients/ImageClient.ts)

**New Methods:**

```typescript
// Upload image to specific variant
async uploadVariantImage(
  productId: string,
  variantId: string,
  imageType: 'hero-card' | 'info-card' | 'other',
  file: File,
  metadata?: { altText?: string; displayOrder?: number; variantWeight?: string }
): Promise<AxiosResponse<ProductImage>>

// Delete variant image
async deleteVariantImage(
  productId: string,
  variantId: string,
  imageType: string,
  imageId: string
): Promise<AxiosResponse<{ message: string }>>
```

---

## MinIO Folder Structure

### Format
```
products/
  {productId}/
    {variantWeight}/
      hero-card/
        {imageId}.{ext}         # Max 1 image, auto-replace on upload
      info-card/
        {imageId}.{ext}         # Max 1 image, auto-replace on upload
      other-images/
        {imageId}.{ext}         # Unlimited, ordered by displayOrder
```

### Example for "Organic Olive Oil"
```
products/
  abc-123-def/
    500ml/
      hero-card/
        img-001.jpg
      info-card/
        img-002.jpg
      other-images/
        img-003.jpg
        img-004.jpg
        img-005.jpg
    1kg/
      hero-card/
        img-006.jpg
      info-card/
        img-007.jpg
      other-images/
        img-008.jpg
        img-009.jpg
```

---

## Database State After Migration

### product_images Table
```sql
-- New columns added:
variantId UUID (nullable)       -- Links to specific variant
variantWeight VARCHAR (nullable) -- Denormalized weight (e.g., "500ml")
imageType VARCHAR (default='other') -- 'hero-card' | 'info-card' | 'other'

-- Index created:
idx_product_images_variant_type (variantId, imageType)

-- Existing columns:
id, productId, categoryId, categoryName, productName, imageUrl, altText,
fileName, displayOrder, isDefault, createdAt, updatedAt
```

---

## Implementation Flow

### Upload Variant Image
```
1. Admin uploads image for variant
2. POST /admin/products/{id}/variants/{variantId}/images/{imageType}
3. Service receives: productId, variantId, variantWeight, imageType, file
4. Service creates folder path: products/{productId}/{variantWeight}/{imageType}/
5. MinIO uploads file to that path
6. If hero-card/info-card:
   - Check if existing image of same type exists
   - If yes: Delete old image from MinIO & DB, then save new
   - If no: Just save new
7. Database record created with variantId, variantWeight, imageType
8. Response: ProductImage with all metadata
```

### Fetch Variant Images
```
1. Query: SELECT * FROM product_images WHERE productId = ? AND variantId = ?
2. Results grouped by imageType:
   {
     heroCard: { id, imageUrl, ... },           # 0 or 1
     infoCard: { id, imageUrl, ... },           # 0 or 1
     otherImages: [{ id, imageUrl, ... }, ...] # 0 or many, ordered by displayOrder
   }
3. Admin UI displays in organized tabs
```

---

## Backward Compatibility

### Legacy Product Images (No Variant)
- Existing images without `variantId` continue to work
- New images can still be uploaded without variant context
- `imageType` defaults to 'other' for legacy images
- `displayOrder` used for ordering of 'other' type images

---

## Pending Implementation Phases

### PHASE 2: Admin UI Redesign
**Files to Update:**
- `apps/admin-web/src/components/products/ProductImageGallery.tsx`
- `apps/admin-web/src/components/products/ProductImageUpload.tsx`
- `apps/admin-web/src/pages/products/[id]/edit.tsx`

**Tasks:**
1. Create variant-aware image gallery component
2. Add tabs for each variant (500ml, 1kg, etc.)
3. Add image type sections (hero-card, info-card, other-images)
4. Implement drag-and-drop reordering for "other" images
5. Add auto-replace UI for hero/info cards
6. Show variant weight label (e.g., "500ml (Default)" with star icon)

### PHASE 3: MinIO ↔ DB Sync
**Endpoints:**
- `GET /admin/products/:id/images/sync` - Check consistency
- `POST /admin/products/:id/images/sync` - Force sync
- `POST /admin/products/:id/variants/:variantId/sync` - Variant-level sync

**Logic:**
1. Compare MinIO folder structure with DB records
2. Delete orphaned files (in MinIO but not in DB)
3. Create missing DB records (in MinIO but not in DB)
4. Handle renamed variant weights (update fileName paths)

### PHASE 4: Variant Deletion Handling
**Logic:**
- When variant deleted: Auto-delete variant-specific images from MinIO & DB
- Update service: `deleteVariant()` method

---

## Testing Checklist

### API Tests
- [ ] Upload image to variant hero-card endpoint
- [ ] Upload image to variant info-card endpoint
- [ ] Upload image to variant other-images endpoint
- [ ] Auto-replace hero-card when uploading second image
- [ ] Auto-replace info-card when uploading second image
- [ ] Allow multiple other-images uploads
- [ ] Delete variant image endpoint works
- [ ] Fetch all product images with variant grouping
- [ ] Legacy image uploads still work

### Database Tests
- [ ] Migrate ProductImage table with new columns
- [ ] Index created on (variantId, imageType)
- [ ] Insert records with variantId/variantWeight/imageType
- [ ] Query images by variant efficiently

### MinIO Tests
- [ ] Folder structure created correctly: `products/{id}/{weight}/{type}/`
- [ ] Files uploaded to correct paths
- [ ] Old hero-card/info-card auto-deleted from MinIO
- [ ] File names preserved in DB for deletion tracking

---

## Code Examples

### Upload Image to Variant
```typescript
// Client Side (React)
const uploadVariantImage = async (productId, variantId, variantWeight, imageType, file) => {
  const response = await imageClient.uploadVariantImage(
    productId,
    variantId,
    imageType,
    file,
    { variantWeight, altText: 'Product variant image' }
  );
  return response.data;
};

// Usage
const image = await uploadVariantImage(productId, variantId, '500ml', 'hero-card', file);
// Image stored at: products/{productId}/500ml/hero-card/{imageId}.jpg
```

### Fetch Images Grouped by Variant
```typescript
// Server Side (NestJS)
@Get(':id/images')
async getProductImages(@Param('id') productId: string) {
  const images = await this.productImageRepository.find({
    where: { productId },
    order: { createdAt: 'DESC' }
  });
  
  // Group by variant
  const grouped = {};
  images.forEach(img => {
    const key = img.variantId || 'product';
    if (!grouped[key]) grouped[key] = { heroCard: null, infoCard: null, otherImages: [] };
    
    if (img.imageType === 'hero-card') grouped[key].heroCard = img;
    else if (img.imageType === 'info-card') grouped[key].infoCard = img;
    else grouped[key].otherImages.push(img);
  });
  
  return grouped;
}
```

---

## Configuration

### Environment Variables (No new vars needed)
- Uses existing MinIO connection
- Uses existing PostgreSQL connection

### TypeORM Synchronization
- If using synchronize: true, changes will be auto-applied
- Otherwise, migrations must be run: `npm run migrations:run`

---

## Performance Optimizations

1. **Index on (variantId, imageType)**:
   - Fast queries for finding variant-specific images
   - Supports auto-replace logic efficiently

2. **Lazy Loading Images**:
   - Only load images when variant is expanded in admin UI
   - Use pagination for many-image variants

3. **MinIO Path Strategy**:
   - Folder-based organization reduces object list overhead
   - Enables efficient bulk deletion when variant removed

---

## Known Limitations & Future Work

1. **Image Reordering**: "Other" images can be reordered by displayOrder, but UI not yet implemented
2. **Bulk Upload**: No bulk variant image upload yet (Phase 2)
3. **Image Optimization**: No automatic compression/thumbnail generation
4. **Version Control**: No image versioning or rollback capability
5. **Multi-Locale**: No separate images per locale/region

---

## Migration Rollback

To rollback this migration:

```bash
# NestJS TypeORM migration revert
npx typeorm migration:revert -d dist/database.js

# Manual SQL (if needed)
ALTER TABLE "product_images" DROP COLUMN "variantId";
ALTER TABLE "product_images" DROP COLUMN "variantWeight";
ALTER TABLE "product_images" DROP COLUMN "imageType" DEFAULT 'other';
DROP INDEX idx_product_images_variant_type;
```

---

## Related Documentation

- [PRODUCT_IMAGE_MANAGEMENT_BRD.md](./PRODUCT_IMAGE_MANAGEMENT_BRD.md) - Architecture & Business Rules
- [product.entity.ts](../apps/api/src/entities/product.entity.ts) - Entity definitions
- [admin-products.service.ts](../apps/api/src/admin-products/admin-products.service.ts) - Service implementation
- [admin-products.controller.ts](../apps/api/src/admin-products/admin-products.controller.ts) - Controller endpoints

---

**Last Updated**: 2024
**Implemented By**: AI Assistant
**Status**: Phase 1 Complete, Phases 2-4 Pending
