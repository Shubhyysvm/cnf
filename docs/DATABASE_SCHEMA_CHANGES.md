# Database Schema Changes - Product Denormalization (2025-12-20)

## Overview
Enhanced database schema with product denormalization for improved clarity, performance, and maintainability. All product-related tables now include contextual product information without requiring joins.

---

## Changes Summary

### 1. Column Rename: `product_variants.name` → `product_variants.weight`

**Reason:** The `name` column actually contains size/weight values (e.g., "500ML", "1000G"), not product names. Renaming clarifies the column's purpose.

**Affected Table:**
- `product_variants`

**Migration SQL (for existing databases):**
```sql
ALTER TABLE "product_variants" RENAME COLUMN "name" TO "weight";
```

---

### 2. Added `productName` Column to Product-Related Tables

**Reason:** Denormalization reduces join operations, improves query performance, and makes database structure more intuitive.

#### Table: `product_variants`
**New Columns:**
- `productName` (VARCHAR, NOT NULL) - Product name denormalized from `products` table

**Benefits:**
- Quick identification of which product a variant belongs to
- No join needed to display variant information
- Clearer database records when browsing directly

**Index:** Already has index on `(productId, isDefault)`

---

#### Table: `product_views`
**New Columns:**
- `productName` (VARCHAR, NOT NULL) - Product name
- `variantWeight` (VARCHAR) - Variant weight/size for context

**Benefits:**
- Complete tracking data without joins
- Analytics queries faster
- Clear visibility into which products/variants are viewed

---

#### Table: `stock_notifications`
**New Columns:**
- `productName` (VARCHAR, NOT NULL) - Product name
- `productId` (UUID, FK, NOT NULL) - Explicit foreign key (was missing)
- `variantWeight` (VARCHAR) - Variant weight for notification context

**Benefits:**
- Clear notification content display
- Admin can see product context at a glance
- Email/SMS notifications can include product name without extra queries

---

#### Table: `cart_items`
**New Columns:**
- `productName` (VARCHAR, NOT NULL) - Product name
- `variantId` (UUID) - Reference to specific variant
- `variantWeight` (VARCHAR) - Variant weight/size

**Removed:**
- `variant` (VARCHAR) - Replaced with structured `variantId` + `variantWeight`

**Benefits:**
- Better cart data structure
- Can display product+variant info without joins
- Clear variant selection tracking

---

#### Table: `order_items`
**Existing Columns:** `productName` already present

**New Columns:**
- `variantId` (UUID) - Explicit variant reference
- `variantWeight` (VARCHAR) - Variant weight at time of purchase

**Removed:**
- `variantWeight` was already present, now clarified with `variantId`

**Benefits:**
- Complete order history with variant details
- Can reconstruct purchase exactly as it was (historical data)

---

## Schema Comparison

### Before
```
product_variants:
  - id (PK)
  - productId (FK)
  - name ← Contains "500ML", "1000G" (confusing)
  - price
  - sku
  - ... (no product name reference)

product_views:
  - id (PK)
  - productId (FK)
  - variantId (FK)
  - (no productName context)

stock_notifications:
  - id (PK)
  - variantId (FK)
  - (no productId, no productName context)

cart_items:
  - id (PK)
  - productId (FK)
  - variant ← Text field (unstructured)
  - (no productName)

order_items:
  - id (PK)
  - productId (FK)
  - productName ✓ (good)
  - variantWeight (but no variantId)
```

### After
```
product_variants:
  - id (PK)
  - productId (FK)
  - productName ← Denormalized for clarity
  - weight ← Clear naming (was "name")
  - price
  - sku
  - ... (complete product context)

product_views:
  - id (PK)
  - productId (FK)
  - productName ← For analytics
  - variantId (FK)
  - variantWeight ← Complete variant context

stock_notifications:
  - id (PK)
  - productId (FK) ← Now explicit (was missing)
  - productName ← For notifications
  - variantId (FK)
  - variantWeight ← For context

cart_items:
  - id (PK)
  - productId (FK)
  - productName ← For display
  - variantId (FK) ← Structured (was "variant")
  - variantWeight ← Clear variant reference

order_items:
  - id (PK)
  - productId (FK)
  - productName ✓
  - variantId (FK) ← Now included
  - variantWeight ✓
```

---

## Implementation Checklist

- [x] Updated `database_schema.sql` with all changes
- [x] Updated BRD (Business Requirements Document) - ProductVariants section
- [x] Updated PROJECT_TRACKER.md - Database Schema Enhancements section
- [ ] **TODO for Backend Team:** 
  - Update TypeORM entities in `apps/api/src/entities/`
  - Update API DTOs/response objects
  - Update product creation/update logic to populate `productName`
  - Create database migration (if existing DB)
  - Update seed script to populate new columns
  - Update API endpoints to return new fields
- [ ] **TODO for Admin Console:**
  - Update product forms to reflect renamed column (if needed)
  - Update table displays to show variant weight instead of "name"
- [ ] **TODO for Testing:**
  - Verify all CRUD operations work with new schema
  - Test cart operations with denormalized data
  - Test notification generation
  - Verify view tracking includes product name

---

## Migration Path for Existing Databases

### Step 1: Backup
```sql
-- Backup current data
CREATE TABLE backup_product_variants AS SELECT * FROM "product_variants";
```

### Step 2: Add New Columns
```sql
-- Rename column
ALTER TABLE "product_variants" RENAME COLUMN "name" TO "weight";

-- Add productName (denormalized from products)
ALTER TABLE "product_variants" ADD COLUMN "productName" VARCHAR NOT NULL DEFAULT '';

-- Add columns to other tables
ALTER TABLE "product_views" ADD COLUMN "productName" VARCHAR NOT NULL DEFAULT '';
ALTER TABLE "product_views" ADD COLUMN "variantWeight" VARCHAR;

ALTER TABLE "stock_notifications" ADD COLUMN "productName" VARCHAR NOT NULL DEFAULT '';
ALTER TABLE "stock_notifications" ADD COLUMN "productId" UUID;
ALTER TABLE "stock_notifications" ADD COLUMN "variantWeight" VARCHAR;
ALTER TABLE "stock_notifications" ADD FOREIGN KEY ("productId") REFERENCES "products"("id");

ALTER TABLE "cart_items" ADD COLUMN "productName" VARCHAR NOT NULL DEFAULT '';
ALTER TABLE "cart_items" ADD COLUMN "variantId" UUID;
ALTER TABLE "cart_items" ADD COLUMN "variantWeight" VARCHAR;
ALTER TABLE "cart_items" DROP COLUMN "variant";

ALTER TABLE "order_items" ADD COLUMN "variantId" UUID;
```

### Step 3: Backfill Data
```sql
-- Populate productName from products table
UPDATE "product_variants" pv
SET "productName" = p."name"
FROM "products" p
WHERE pv."productId" = p."id";

UPDATE "product_views" pv
SET "productName" = p."name"
FROM "products" p
WHERE pv."productId" = p."id";

UPDATE "stock_notifications" sn
SET "productId" = pv."productId",
    "productName" = p."name",
    "variantWeight" = pv."weight"
FROM "product_variants" pv
JOIN "products" p ON pv."productId" = p."id"
WHERE sn."variantId" = pv."id";

-- For cart_items and order_items, use application logic to populate
```

### Step 4: Remove Default Values
```sql
ALTER TABLE "product_variants" ALTER COLUMN "productName" DROP DEFAULT;
ALTER TABLE "product_views" ALTER COLUMN "productName" DROP DEFAULT;
ALTER TABLE "stock_notifications" ALTER COLUMN "productName" DROP DEFAULT;
ALTER TABLE "cart_items" ALTER COLUMN "productName" DROP DEFAULT;
```

---

## Performance Impact

| Metric | Before | After | Impact |
|--------|--------|-------|--------|
| product_variants query | Requires JOIN to get product name | No JOIN needed | ✓ Faster |
| stock_notifications query | Incomplete data without joins | Complete data in one table | ✓ Faster |
| cart_items display | Requires product lookup | Direct productName | ✓ Faster |
| Database size | Smaller (less denormalization) | Slightly larger (denormalized) | Negligible |
| Write performance | Faster (less data) | Slightly slower (more data to write) | Negligible |

**Conclusion:** Read performance significantly improves. Write performance impact negligible.

---

## File References

- **Database Schema:** `/database_schema.sql`
- **BRD Update:** `/docs/BRD_Country_Natural.txt` (ProductVariants section + Changelog)
- **Project Tracker:** `/docs/PROJECT_TRACKER.md` (New section: Database Schema Enhancements)

---

## Questions?

For questions about these changes, refer to:
1. BRD Section 6 - Database Design
2. PROJECT_TRACKER.md - Database Schema Enhancements (2025-12-20)
3. This document
