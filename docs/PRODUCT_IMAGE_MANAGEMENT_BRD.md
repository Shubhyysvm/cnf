# Product Image Management System - BRD

## Overview
This document outlines the new product image management system that organizes images by variant and image type within MinIO, while maintaining synchronization between MinIO and the database.

## Storage Architecture

### MinIO Folder Structure
```
country-natural-foods/
├── categories/
│   └── {categorySlug}/
│       └── {image-files}
└── products/
    └── {productId}/
        ├── {variant-weight}-{variant-weight-number}/  # e.g., "500ml" or "1kg"
        │   ├── hero-card/           # Single hero image (1 image max, auto-replace)
        │   │   └── {filename}
        │   ├── info-card/           # Single info card image (1 image max, auto-replace)
        │   │   └── {filename}
        │   └── other-images/        # Unlimited additional images
        │       ├── {filename}
        │       └── {filename}
        └── {variant-weight-2}/
            ├── hero-card/
            ├── info-card/
            └── other-images/
```

### Naming Convention
- Variant folders: `{weight}` (e.g., `500ml`, `1kg`, `100g`)
- Default variant suffix: Add `- default` to folder name if it's the default variant for the product
  - Example: `500ml - default`, `1kg - default`

## Database Schema

### ProductImage Entity Changes
```typescript
@Entity('product_images')
export class ProductImage {
  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid', nullable: true })
  variantId: string; // Link to ProductVariant
  
  @Column({ type: 'varchar' })
  variantWeight: string; // Denormalized for easy access (e.g., "500ml")

  @Column({ type: 'varchar' })
  imageType: 'hero-card' | 'info-card' | 'other'; // Image categorization

  @Column({ type: 'varchar' })
  imageUrl: string; // Full MinIO URL

  @Column({ type: 'varchar' })
  fileName: string; // Stored object key

  @Column({ type: 'varchar', nullable: true })
  altText: string;

  // ... other fields
}
```

**Note:** The `displayOrder` and `isDefault` columns have been removed. Gallery images are displayed in insertion order (by `createdAt`). The hero-card image for each variant is automatically used as the default/featured image in the UI.

## Upload Rules

### Hero Card & Info Card
- **Max images:** 1 per variant per type
- **Auto-replace:** When uploading a new hero/info card image, automatically delete the old one
- **Behavior:** Any new upload replaces the existing image

### Other Images
- **Max images:** Unlimited
- **Display order:** Images are displayed in insertion order (by `createdAt` timestamp)
- **Behavior:** New uploads append to the list

### Default Image Strategy
- **Hero-card images are used as default/featured images** in product listings and homepage
- No database flag needed - the UI automatically uses the hero-card image for each variant
- If no hero-card exists, the system falls back to the first available image

### Variant-Image Relationship
- When a variant is created, create empty folders for `hero-card`, `info-card`, and `other-images`
- When a variant is deleted, delete all associated images from MinIO and database
- When a variant weight is changed, update the folder structure in MinIO (via background job or admin action)

## Admin Product Edit/Create Page

### UI Structure
```
Product: Ground Nut Oil
├── Variant 1: 500ml (DEFAULT)
│   ├── Hero Card
│   │   └── [Upload/Replace Image] [Preview] [Delete]
│   ├── Info Card
│   │   └── [Upload/Replace Image] [Preview] [Delete]
│   └── Other Images
│       ├── [Image 1] [Delete]
│       ├── [Image 2] [Delete]
│       └── [+ Add Image]
├── Variant 2: 1kg
│   ├── Hero Card
│   ├── Info Card
│   └── Other Images
└── [+ Add Variant]
```

## Synchronization Rules

### MinIO to DB Sync
1. **On Create Product:** Create product folder in MinIO
2. **On Add Variant:** Create variant folder with sub-folders (hero-card, info-card, other-images)
3. **On Upload Image:** Store in appropriate subfolder, create DB record
4. **On Delete Image:** Remove from MinIO folder and DB
5. **On Replace Image:** Update existing file in MinIO, update DB record

### DB to MinIO Sync
1. **On Update Variant Weight:** Rename folder in MinIO from old weight to new weight
2. **On Delete Variant:** Delete entire variant folder and all images from MinIO
3. **On Mark as Default:** Update folder name to include " - default" suffix
4. **On Unmark Default:** Remove " - default" suffix from folder name

### Consistency Checks
- Admin can run a "Sync" operation to reconcile MinIO and DB
- Missing DB records → flag for manual review or auto-delete from MinIO
- Missing MinIO files → flag in admin UI, option to delete DB record

## Implementation Phases

### Phase 1: Database & Backend
- [ ] Create migration to add `imageType` and `variantId` columns to `product_images`
- [ ] Update ProductImage entity
- [ ] Update upload controller to use new folder structure
- [ ] Implement auto-replace logic for hero/info cards
- [ ] Implement variant folder creation/deletion

### Phase 2: Admin UI
- [ ] Update product create/edit page to show variant-based image structure
- [ ] Implement hero/info/other image upload UI
- [ ] Add image preview and delete functionality
- [ ] Add variant management (create, update, delete with folder sync)

### Phase 3: Sync & Consistency
- [ ] Implement folder renaming when variant weight changes
- [ ] Implement folder deletion when variant is deleted
- [ ] Add sync operation endpoint
- [ ] Add consistency check UI in admin

## API Endpoints

### Image Upload
```
POST /products/:productId/variants/:variantId/images/:imageType
- imageType: 'hero-card' | 'info-card' | 'other'
- Body: FormData { file, displayOrder? (for other), altText? }
```

### Image Delete
```
DELETE /products/:productId/variants/:variantId/images/:imageType/:imageId
```

### Image Replace (Hero/Info only)
```
PATCH /products/:productId/variants/:variantId/images/:imageType
- Body: FormData { file }
```

### Variant Folder Sync
```
POST /products/:productId/variants/:variantId/sync-folders
- Renames MinIO folders when weight changes
```

## Notes
- All folder names use lowercase and hyphens
- Image filenames maintain timestamps for uniqueness
- MinIO lifecycle policies can auto-delete old variants
- Database always source of truth for metadata (altText, displayOrder, etc.)
