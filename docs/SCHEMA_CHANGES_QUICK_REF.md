# Quick Reference - Database Schema Changes

## What Changed?

### ✅ Column Renamed
- `product_variants.name` → `product_variants.weight`
  - Why: `name` field contains sizes like "500ML", "1000G", not actual names

### ✅ New Columns Added to All Product Tables

| Table | New Columns | Purpose |
|-------|-------------|---------|
| `product_variants` | `productName` | Know which product a variant belongs to |
| `product_views` | `productName`, `variantWeight` | Track product context in view analytics |
| `stock_notifications` | `productName`, `productId`, `variantWeight` | Complete notification context |
| `cart_items` | `productName`, `variantId`, `variantWeight` | Display cart without extra queries |
| `order_items` | `variantId`, `variantWeight` | Complete order history tracking |

---

## Why?

1. **Clarity:** No more confusion about what columns contain
2. **Performance:** Fewer database joins needed
3. **Maintainability:** Team can understand data without deep analysis
4. **Better UX:** Admin console and API responses more informative

---

## What Needs to Be Updated?

### Backend (`apps/api/src/entities/`)
- [ ] Rename `name` → `weight` in ProductVariant entity
- [ ] Add `productName: string` to ProductVariant
- [ ] Add `productName: string` to ProductView
- [ ] Update ProductView to include `variantWeight`
- [ ] Add `productId`, `productName`, `variantWeight` to StockNotification
- [ ] Update CartItem to use `variantId` + `variantWeight` (remove `variant`)
- [ ] Add `variantId` to OrderItem

### Seed Data (`apps/api/src/database/seed.ts`)
- [ ] Populate `productName` when creating variants

### API Endpoints
- [ ] Return new fields in responses
- [ ] Accept new fields in request bodies where appropriate

### Admin Console
- [ ] Display variant `weight` instead of `name` in tables
- [ ] Update product forms if needed

### Migrations
- [ ] Create database migration to add new columns
- [ ] Backfill `productName` from products table
- [ ] Rename `name` → `weight` in product_variants

---

## Database Schema File

Located: `/database_schema.sql`

All changes are included. For new environments, use this directly.
For existing databases, see `DATABASE_SCHEMA_CHANGES.md` for migration steps.

---

## Documentation Files Updated

1. `/database_schema.sql` - Complete updated schema
2. `/docs/BRD_Country_Natural.txt` - ProductVariants section + changelog
3. `/docs/PROJECT_TRACKER.md` - Database Schema Enhancements section
4. `/DATABASE_SCHEMA_CHANGES.md` - Complete migration guide (this folder root)

---

## Quick SQL Reference

### See Current Schema
```sql
-- View product_variants structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'product_variants'
ORDER BY ordinal_position;

-- View all tables with product references
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE '%product%';
```

### Verify Changes (After Migration)
```sql
-- Check if weight column exists (renamed from name)
SELECT column_name FROM information_schema.columns
WHERE table_name = 'product_variants' AND column_name = 'weight';

-- Check if productName columns added
SELECT column_name FROM information_schema.columns
WHERE column_name = 'productName'
ORDER BY table_name;
```

---

## For Questions

See: `DATABASE_SCHEMA_CHANGES.md` in project root
