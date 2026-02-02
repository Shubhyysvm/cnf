# Wishlist & Cart Schema Analysis & Recommendations

## Current State Analysis

### 📊 Existing Schema Review

#### **Wishlists Table** (NEEDS UPDATE)
```sql
CREATE TABLE "wishlists" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL,
  "productId" uuid NOT NULL,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
```

**Issues:**
- ❌ Missing `variantId` column
- ❌ Cannot track which specific variant user wants (e.g., 500ml vs 1L)
- ❌ User adds product to wishlist but when they try to buy, they need to select variant again

#### **Cart_Items Table** (ALREADY GOOD)
```sql
CREATE TABLE "cart_items" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "cartId" uuid NOT NULL,
  "productId" uuid NOT NULL,
  "quantity" integer NOT NULL DEFAULT 1,
  "price" numeric NOT NULL,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  "variant" character varying(50),  -- ⚠️ String-based (old approach)
  PRIMARY KEY ("id")
);
```

**Issues:**
- ⚠️ Uses `variant` as VARCHAR instead of UUID reference
- ⚠️ No foreign key relationship to `product_variants` table
- ⚠️ Harder to maintain data integrity

#### **Add_to_Cart_Events Table** (ANALYTICS - ALREADY PERFECT)
```sql
CREATE TABLE "add_to_cart_events" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "userId" uuid,
  "sessionId" character varying(255),
  "productId" uuid NOT NULL,
  "variantId" uuid,  -- ✅ Proper UUID reference
  "quantity" integer NOT NULL,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
```
**Already has proper `variantId` with foreign key!**

---

## 🎯 Recommendations

### **Recommendation 1: Update Wishlist Table (CRITICAL)**

Add `variantId` column to match cart_items and add_to_cart_events pattern:

```sql
-- Add variantId column to wishlists
ALTER TABLE wishlists ADD COLUMN "variantId" uuid;

-- Add foreign key constraint
ALTER TABLE wishlists 
  ADD CONSTRAINT "FK_wishlists_variant" 
  FOREIGN KEY ("variantId") 
  REFERENCES "product_variants" ("id") 
  ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX "IDX_wishlists_variant" ON "wishlists" ("variantId");

-- Update unique constraint to include variantId
DROP INDEX IF EXISTS "UQ_wishlists_user_product";
CREATE UNIQUE INDEX "UQ_wishlists_user_product_variant" 
  ON "wishlists" ("userId", "productId", "variantId");
```

**Benefits:**
- ✅ User selects specific variant when adding to wishlist (e.g., "500ml" vs "1L")
- ✅ One-click "Move to Cart" with exact variant they wanted
- ✅ Better UX: No need to re-select variant when purchasing
- ✅ Analytics: Track which variants are most wishlisted
- ✅ Consistent with cart_items and add_to_cart_events

---

### **Recommendation 2: Modernize Cart_Items Table (RECOMMENDED)**

Replace VARCHAR `variant` with proper UUID `variantId`:

```sql
-- Add new variantId column
ALTER TABLE cart_items ADD COLUMN "variantId" uuid;

-- Migrate existing data (if any) - requires manual mapping
-- This would need a custom migration script based on your variant data

-- Add foreign key constraint
ALTER TABLE cart_items 
  ADD CONSTRAINT "FK_cart_items_variant" 
  FOREIGN KEY ("variantId") 
  REFERENCES "product_variants" ("id") 
  ON DELETE SET NULL;

-- Add index
CREATE INDEX "IDX_cart_items_variant" ON "cart_items" ("variantId");

-- After migration complete, drop old column
ALTER TABLE cart_items DROP COLUMN "variant";

-- Add denormalized variantWeight for display (optional but recommended)
ALTER TABLE cart_items ADD COLUMN "variantWeight" varchar(50);
```

**Benefits:**
- ✅ Referential integrity with foreign keys
- ✅ Easier to query variant details (price, stock, discount)
- ✅ Consistent with add_to_cart_events pattern
- ✅ Better for inventory management
- ✅ Prevents orphaned cart items when variants deleted

---

### **Recommendation 3: Enhanced Wishlist Features (OPTIONAL - PHASE 2)**

Consider adding these columns for advanced features:

```sql
-- Priority level for wishlist items
ALTER TABLE wishlists ADD COLUMN "priority" integer DEFAULT 0;

-- Notes (e.g., "Gift for mom's birthday")
ALTER TABLE wishlists ADD COLUMN "note" text;

-- Price tracking - save price when added
ALTER TABLE wishlists ADD COLUMN "priceWhenAdded" numeric(10,2);

-- Notify when back in stock
ALTER TABLE wishlists ADD COLUMN "notifyOnStock" boolean DEFAULT false;

-- Notify when price drops
ALTER TABLE wishlists ADD COLUMN "notifyOnPriceDrop" boolean DEFAULT false;
```

---

### **Recommendation 4: Unified Cart Architecture (CURRENT IS GOOD)**

Your current cart architecture is actually well-designed:

**Current Structure:**
```
carts (parent)
  ├── id, userId, sessionId, expiresAt
  └── cart_items (children) - CASCADE delete
        ├── productId, variantId, quantity, price
        └── Proper foreign keys
```

**Keep This Pattern Because:**
- ✅ Supports guest carts (sessionId)
- ✅ Supports logged-in user carts (userId)
- ✅ Automatic cleanup (expiresAt)
- ✅ Cascade delete keeps data clean
- ✅ Proper normalization

**No Changes Needed - Just Modernize variantId as shown above**

---

## 📋 Migration Strategy

### **Phase 1: Critical Updates (Do Now)**

1. **Update Wishlist Table**
   - Add `variantId` column
   - Add foreign key to product_variants
   - Update unique constraint
   - Update API endpoints to handle variantId
   - Update mobile app wishlist logic

2. **Update Cart Items Table** 
   - Add `variantId` UUID column
   - Keep old `variant` VARCHAR temporarily
   - Migrate existing data
   - Update API to use new column
   - Drop old column after verification

### **Phase 2: Enhanced Features (Later)**

3. **Wishlist Enhancements**
   - Price tracking
   - Stock notifications integration
   - Priority/notes

4. **Cart Enhancements**
   - Save for later feature
   - Cart abandonment tracking (already have checkout_abandonments table)

---

## 🔄 API Updates Required

### **Wishlist Endpoints to Update**

```typescript
// POST /wishlists - Add to wishlist
{
  "productId": "uuid",
  "variantId": "uuid"  // ← NEW: Required
}

// GET /wishlists/:userId - Get user's wishlist
// Response should include variant details:
{
  "id": "uuid",
  "productId": "uuid",
  "variantId": "uuid",
  "product": { ... },
  "variant": {  // ← NEW: Include variant details
    "id": "uuid",
    "weight": "500ml",
    "price": 299,
    "discountPrice": 279,
    "stockQuantity": 50
  }
}
```

### **Cart Endpoints to Update**

```typescript
// POST /cart/items - Add to cart
{
  "productId": "uuid",
  "variantId": "uuid",  // ← Ensure this is UUID, not string
  "quantity": 1
}

// Update cart service to join with product_variants table
```

---

## 📊 Database Schema Comparison

### **Before (Current)**
```
wishlists: [userId, productId] ← Missing variant info
cart_items: [cartId, productId, variant(string)] ← String-based
```

### **After (Recommended)**
```
wishlists: [userId, productId, variantId(uuid)] ← Proper reference
cart_items: [cartId, productId, variantId(uuid)] ← UUID reference
```

**Consistency:**
```
✅ add_to_cart_events → variantId (UUID) ✓
✅ wishlists → variantId (UUID) ✓ [AFTER UPDATE]
✅ cart_items → variantId (UUID) ✓ [AFTER UPDATE]
✅ product_views → variantId (UUID) ✓ [ALREADY EXISTS]
✅ stock_notifications → variantId (UUID) ✓ [ALREADY EXISTS]
```

---

## 🎨 Mobile App Impact

### **Wishlist Flow Update**

**Before:**
1. User taps heart icon on product
2. Saves product only
3. Later: User views wishlist, clicks item
4. Redirected to product page
5. Must select variant again ❌

**After:**
1. User taps heart icon on product card
2. **Shows variant selector if multiple variants**
3. Saves product + selected variant
4. Later: User views wishlist
5. "Add to Cart" button directly adds exact variant ✅
6. Or shows "Out of Stock" for that specific variant

### **UI Changes Needed**

```typescript
// ProductCard.tsx - Wishlist button
<TouchableOpacity onPress={() => {
  if (hasMultipleVariants) {
    // Show variant picker modal first
    showVariantPicker(product, (selectedVariant) => {
      addToWishlist(product.id, selectedVariant.id);
    });
  } else {
    // Single variant - add directly
    addToWishlist(product.id, defaultVariant.id);
  }
}}>
  <Icon name="heart" />
</TouchableOpacity>
```

---

## ✅ Implementation Checklist

- [ ] Create migration file for wishlist table updates
- [ ] Create migration file for cart_items table updates
- [ ] Update Wishlist entity in TypeORM
- [ ] Update CartItem entity in TypeORM
- [ ] Update wishlist service/controller
- [ ] Update cart service/controller
- [ ] Update mobile app WishlistContext
- [ ] Update mobile app CartContext
- [ ] Update ProductCard component
- [ ] Update WishlistScreen component
- [ ] Test variant selection in wishlist
- [ ] Test move to cart from wishlist
- [ ] Test cart with new variantId
- [ ] Update database seed data

---

## 🚀 Quick Start Commands

```powershell
# 1. Create migration
cd C:\xampp\htdocs\CountryNaturalFoods\apps\api
pnpm typeorm migration:create src/migrations/UpdateWishlistAndCartVariants

# 2. Apply migration
pnpm typeorm migration:run

# 3. Verify
# Check Adminer: http://localhost:8080
# Check wishlists table has variantId column
# Check cart_items table has variantId column
```

---

## 📚 Related Documentation

- **BRD Reference:** Wishlist/Favorites: 0% (needs implementation)
- **Project Tracker:** Cart & Checkout at 95% (needs variant improvement)
- **Schema:** product_variants table already exists with proper structure
- **Pattern:** Follow add_to_cart_events as reference (already correct)

---

## 💡 Final Recommendation

**Priority Order:**

1. **HIGH PRIORITY** - Update wishlists table (add variantId)
2. **HIGH PRIORITY** - Update cart_items table (modernize to UUID variantId)
3. **MEDIUM PRIORITY** - Update API endpoints
4. **MEDIUM PRIORITY** - Update mobile app UI
5. **LOW PRIORITY** - Add wishlist enhancements (price tracking, etc.)

**Estimated Time:**
- Database migrations: 30 minutes
- API updates: 2-3 hours
- Mobile app updates: 3-4 hours
- Testing: 2 hours
- **Total: 1 day**

This will bring your wishlist and cart to the same quality level as your add_to_cart_events table!
