# Backend Implementation: Cart & Wishlist System

## Overview

This document outlines the complete backend implementation for the Cart and Wishlist system with support for both guest and authenticated users.

---

## 1. Currency Handling

### Decision: Remove Currency Column

**Rationale:**
- CountryNaturalFoods operates only in India
- All prices are always in Indian Rupees (INR)
- No need to store currency per cart
- Reduces database size and simplifies queries

**Implementation:**
- ✅ Removed `currency` column from `carts` table
- ✅ Return `"currency": "INR"` in all API responses as a constant
- ✅ Mobile app and frontend can rely on this constant
- ✅ Future expansion: If multi-currency support needed, add column back

**Migration:**
```sql
-- Remove currency column
ALTER TABLE "carts" DROP COLUMN IF EXISTS "currency";

-- No need to migrate data (it was always 'INR')
```

---

## 2. Guest Session Persistence

### How Guest Session Works

**When Guest Adds to Cart:**
1. Frontend generates `sessionId` (browser session UUID)
2. Stores in `localStorage`
3. Sends in header: `x-session-id: sess_123abc`
4. Backend creates cart with:
   - `userId: NULL`
   - `sessionId: "sess_123abc"`
   - `expiresAt: now() + 7 days`

**When Guest Returns Next Day (Same Device):**
1. `sessionId` persists in `localStorage`
2. Same `x-session-id` header sent
3. Backend finds cart using `sessionId`
4. **Cart and wishlist items are restored!** ✓

**Example Timeline:**
```
[Day 1, 10:00 AM]
├─ Guest adds "Coconut Oil 500ml" to cart
├─ sessionId: "abc-123-def" stored in localStorage
├─ Cart created with: userId=NULL, sessionId="abc-123-def", expiresAt=[8 days later]
└─ Wishlist item created with: userId=NULL, sessionId="abc-123-def"

[Day 2, 2:00 PM] - User returns on same device
├─ localStorage still has sessionId: "abc-123-def"
├─ Frontend sends x-session-id header
├─ Backend finds cart and wishlist using sessionId
├─ User sees: "Coconut Oil 500ml" × 1 in cart ✓
└─ Wishlist shows saved items ✓

[Day 8+] - Cleanup job runs
├─ DELETE FROM carts WHERE expiresAt < now()
├─ CASCADE delete removes cart_items
├─ Guest cart gone (but events remain in add_to_cart_events)
```

---

## 3. Guest to User Conversion (Login Flow)

### What Happens When Guest Logs In

**Scenario:** Guest added items to cart, then logs in

**Current Behavior:**
- Guest cart persists with `userId=NULL`
- New user sessions can co-exist with guest cart
- Frontend can display both (or choose to merge)

**Recommended Flow (TODO for frontend):**
1. Guest adds items with `sessionId: "sess_123"`
2. Guest logs in → gets `userId: "user-456"`
3. Frontend calls: `POST /api/wishlist/merge` 
   - Merges guest wishlist into user wishlist
   - Keeps guest cart but optionally marks it archived
4. Future logins use `userId` (no `sessionId` needed)

**Backend Method Available:**
```typescript
// In WishlistService
async mergeGuestWishlistToUser(
  sessionId: string,
  userId: string
): Promise<void>
```

---

## 4. Database Schema Changes

### Migration File: `1736630000001-AddGuestWishlistAndRemoveCurrency.ts`

**Changes Made:**

#### Wishlists Table
```sql
-- Add sessionId for guest wishlists
ALTER TABLE "wishlists" ADD COLUMN "sessionId" character varying(100);

-- Add expiry for guest cleanup
ALTER TABLE "wishlists" ADD COLUMN "expiresAt" timestamp;

-- Make userId nullable to support guests
ALTER TABLE "wishlists" ALTER COLUMN "userId" DROP NOT NULL;

-- Indexes for performance
CREATE INDEX "IDX_wishlists_session" ON "wishlists" ("sessionId");
CREATE INDEX "IDX_wishlists_session_product_variant" 
  ON "wishlists" ("sessionId", "productId", "variantId");

-- Unique constraints (allow NULL for guests)
CREATE UNIQUE INDEX "UQ_wishlists_user_product_variant" 
  ON "wishlists" ("userId", "productId", "variantId") 
  WHERE "userId" IS NOT NULL;

CREATE UNIQUE INDEX "UQ_wishlists_session_product_variant" 
  ON "wishlists" ("sessionId", "productId", "variantId") 
  WHERE "sessionId" IS NOT NULL;
```

#### Carts Table
```sql
-- Remove currency column (always INR)
ALTER TABLE "carts" DROP COLUMN IF EXISTS "currency";
```

---

## 5. Entity Changes

### Wishlist Entity (`wishlist.entity.ts`)

**New Fields:**
```typescript
@Column({ type: 'varchar', length: 100, nullable: true })
sessionId: string | null;  // For guest wishlists

@Column({ type: 'timestamp', nullable: true })
expiresAt: Date | null;    // Cleanup old guest wishlists

// Updated userId to nullable
@Column({ type: 'uuid', nullable: true })
userId: string | null;  // Changed from required to optional
```

**New Indexes:**
```typescript
@Index(['userId', 'productId', 'variantId'], { 
  unique: true, 
  where: '"userId" IS NOT NULL'  // Only for authenticated users
})
@Index(['sessionId', 'productId', 'variantId'], { 
  unique: true, 
  where: '"sessionId" IS NOT NULL'  // Only for guests
})
@Index(['sessionId'])  // For quick guest lookup
```

### Cart Entity (`cart.entity.ts`)

**No Changes Needed** - Already supports guests:
```typescript
@Column({ type: 'uuid', nullable: true })
userId: string | null;  // ✓ Already nullable

@Column({ type: 'varchar', length: 100, unique: true })
sessionId: string;  // ✓ For guest identification

@Column({ type: 'timestamp', nullable: true })
expiresAt: Date | null;  // ✓ For guest cleanup
```

---

## 6. API Implementation

### Cart API

#### Endpoints

**GET /cart**
- Retrieves cart for current session/user
- Returns all items with calculated prices
- Response includes `currency: "INR"` constant

```json
{
  "id": "cart-uuid",
  "items": [
    {
      "id": "item-uuid",
      "productId": "prod-uuid",
      "variantId": "var-uuid",
      "productName": "Coconut Oil",
      "variantWeight": "500ml",
      "quantity": 2,
      "price": 299,
      "total": 598
    }
  ],
  "subtotal": 598,
  "itemCount": 2,
  "currency": "INR"
}
```

**POST /cart/items**
```json
{
  "productId": "prod-uuid",
  "variantId": "var-uuid",    // Optional, identifies specific size/weight
  "quantity": 2                // Optional, defaults to 1
}
```

**PATCH /cart/items/:itemId**
```json
{
  "quantity": 5  // New quantity
}
```

**DELETE /cart/items/:itemId**
- Removes item from cart
- Returns updated cart

**DELETE /cart**
- Clears entire cart
- Keeps cart record but removes all items

#### Service Logic

**CartService Methods:**

```typescript
// Create or get existing cart for a session
async getOrCreateCart(sessionId: string): Promise<Cart>

// Add item with variantId (UUID reference)
async addItem(
  sessionId: string,
  productId: string,
  variantId?: string | null,
  quantity: number = 1
): Promise<Cart>

// Update quantity
async updateItemQuantity(
  sessionId: string,
  itemId: string,
  quantity: number
): Promise<Cart>

// Remove item
async removeItem(sessionId: string, itemId: string): Promise<Cart>

// Clear all items
async clearCart(sessionId: string): Promise<void>

// Get cart
async getCart(sessionId: string): Promise<Cart>

// Calculate price based on variant
private calculatePrice(product: Product, variant: ProductVariant | null): number
```

---

### Wishlist API

#### Endpoints

**GET /wishlist**
- Returns all wishlist items for user/guest
- Includes product details and calculated prices

```json
{
  "items": [
    {
      "id": "wishlist-uuid",
      "productId": "prod-uuid",
      "productName": "Coconut Oil",
      "productSlug": "coconut-oil",
      "variantId": "var-uuid",
      "variantWeight": "500ml",
      "price": 299,
      "addedAt": "2025-01-11T10:30:00Z"
    }
  ],
  "itemCount": 1
}
```

**GET /wishlist/check/:productId**
- Check if product is in wishlist

```json
{
  "productId": "prod-uuid",
  "isInWishlist": true
}
```

**GET /wishlist/check/:productId/:variantId**
- Check if specific variant is in wishlist

```json
{
  "productId": "prod-uuid",
  "variantId": "var-uuid",
  "isInWishlist": true
}
```

**POST /wishlist**
```json
{
  "productId": "prod-uuid",
  "variantId": "var-uuid"  // Optional
}
```

**DELETE /wishlist/:productId**
- Remove product from wishlist

**DELETE /wishlist/:productId/:variantId**
- Remove specific variant from wishlist

**DELETE /wishlist**
- Clear entire wishlist

#### Service Logic

**WishlistService Methods:**

```typescript
// Add item to wishlist
async addToWishlist(
  productId: string,
  variantId: string | null,
  userId?: string | null,
  sessionId?: string | null
): Promise<Wishlist>

// Remove from wishlist
async removeFromWishlist(
  productId: string,
  variantId: string | null,
  userId?: string | null,
  sessionId?: string | null
): Promise<void>

// Check if in wishlist
async isInWishlist(
  productId: string,
  variantId: string | null,
  userId?: string | null,
  sessionId?: string | null
): Promise<boolean>

// Get all items
async getWishlist(
  userId?: string | null,
  sessionId?: string | null
): Promise<Wishlist[]>

// Get with formatted details
async getWishlistWithDetails(
  userId?: string | null,
  sessionId?: string | null
): Promise<FormattedWishlistItem[]>

// Clear entire wishlist
async clearWishlist(
  userId?: string | null,
  sessionId?: string | null
): Promise<void>

// Merge guest wishlist to user (on login)
async mergeGuestWishlistToUser(
  sessionId: string,
  userId: string
): Promise<void>

// Calculate price
private calculatePrice(product: Product, variant: ProductVariant | null): number
```

---

## 7. Header Requirements

### Session Identification

**For Guests:**
```
x-session-id: sess_abc123xyz
```
- Generate in mobile app: `const sessionId = generateUUID();`
- Store in `AsyncStorage`
- Send with every cart/wishlist request
- Persists for 7 days

**For Authenticated Users:**
```
x-user-id: user-uuid-123
x-session-id: sess_abc123xyz  // Optional, can be provided
```
- `x-user-id` set by auth middleware
- `x-session-id` can also be sent (for tracking)
- User data persists indefinitely

### Sample Mobile Implementation

```typescript
// Store session
const sessionId = generateUUID();
await AsyncStorage.setItem('sessionId', sessionId);

// Retrieve for requests
const sessionId = await AsyncStorage.getItem('sessionId');

// Send in every request
const headers = {
  'x-session-id': sessionId,
  'x-user-id': userId || null,
  'Content-Type': 'application/json'
};

// Example add to cart
fetch('http://api.example.com/cart/items', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    productId: 'prod-123',
    variantId: 'var-456',
    quantity: 2
  })
});
```

---

## 8. Price Calculation

### Weight-Based Multipliers

Prices are calculated based on product base price × variant weight multiplier:

```typescript
const multipliers: Record<string, number> = {
  '250g': 1.0,     // Base price
  '500g': 1.8,     // 1.8× base price
  '500ml': 1.8,
  '1kg': 3.2,      // 3.2× base price
  '1l': 3.2,
  '2kg': 5.5,      // 5.5× base price
  '2l': 5.5,
};
```

**Example:**
- Product: "Coconut Oil" (base price: ₹200)
- Variant: "500ml"
- Price = 200 × 1.8 = **₹360**

**Stored in Database:**
- `cart_items.price` = ₹360 (snapshot at add-time)
- `cart_items.variantWeight` = "500ml" (for display)
- No need to recalculate on every view

---

## 9. Cascade Delete & Foreign Keys

### Cart Deletion
```sql
carts.id (PK) 
  └─ 1:M ─> cart_items.cartId
      ON DELETE CASCADE
      └─ All items deleted automatically
```

**Result:** Deleting a cart removes all its items

### Product Deletion
```sql
products.id (PK) 
  └─ 1:M ─> cart_items.productId
      ON DELETE RESTRICT
      └─ Can't delete product if in carts (business rule)
  
  └─ 1:M ─> wishlists.productId
      ON DELETE CASCADE
      └─ Wishlist entries deleted with product
```

### Variant Deletion
```sql
product_variants.id (PK) 
  ├─ 1:M ─> cart_items.variantId
  │   ON DELETE SET NULL
  │   └─ variantId becomes NULL (item stays, variant orphaned)
  │
  └─ 1:M ─> wishlists.variantId
      ON DELETE SET NULL
      └─ variantId becomes NULL (wishlist stays, variant orphaned)
```

---

## 10. Testing Checklist

### Cart API Tests

- [ ] GET /cart returns empty cart for new guest
- [ ] POST /cart/items adds item to cart
- [ ] POST /cart/items with same variant increments quantity
- [ ] POST /cart/items with different variant creates new line item
- [ ] PATCH /cart/items/:itemId updates quantity
- [ ] DELETE /cart/items/:itemId removes item
- [ ] DELETE /cart clears entire cart
- [ ] Price calculation correct for variants
- [ ] Cart persists across sessions (same sessionId)
- [ ] Guest cart expires after 7 days

### Wishlist API Tests

- [ ] GET /wishlist returns empty wishlist for new guest
- [ ] POST /wishlist adds item to wishlist
- [ ] POST /wishlist prevents duplicates
- [ ] GET /wishlist/check/:productId returns correct status
- [ ] DELETE /wishlist/:productId removes item
- [ ] DELETE /wishlist clears entire wishlist
- [ ] Wishlist persists across sessions (same sessionId)
- [ ] Guest wishlist can be merged to user on login
- [ ] Unique constraints work (can't add same product twice)

### Data Integrity Tests

- [ ] Deleting variant sets variantId to NULL (not delete item)
- [ ] Deleting product deletes wishlist entries
- [ ] Deleting cart deletes all items
- [ ] Price snapshot is captured at add-time
- [ ] variantWeight stored correctly for display

---

## 11. Running the Migration

### Prerequisites
```bash
cd apps/api

# Install dependencies
pnpm install
```

### Execute Migration
```bash
# Run all pending migrations
pnpm migration:run

# Verify changes
docker exec ts-postgres psql -U countrynaturalfoods -d countrynaturalfoods -c "\d wishlists"
```

### Rollback (if needed)
```bash
# Rollback last migration
pnpm migration:revert

# Verify rollback
docker exec ts-postgres psql -U countrynaturalfoods -d countrynaturalfoods -c "\d wishlists"
```

---

## 12. Frontend Integration Points

### Mobile App (React Native)

**Add to Cart:**
```typescript
const addToCart = async (productId: string, variantId: string, quantity: number) => {
  const sessionId = await AsyncStorage.getItem('sessionId');
  
  const response = await fetch('http://api/cart/items', {
    method: 'POST',
    headers: {
      'x-session-id': sessionId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productId, variantId, quantity })
  });
  
  const updatedCart = await response.json();
  // Update state with new cart
};
```

**Add to Wishlist:**
```typescript
const addToWishlist = async (productId: string, variantId?: string) => {
  const sessionId = await AsyncStorage.getItem('sessionId');
  
  const response = await fetch('http://api/wishlist', {
    method: 'POST',
    headers: {
      'x-session-id': sessionId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productId, variantId })
  });
  
  const updatedWishlist = await response.json();
  // Update state with new wishlist
};
```

### Web App (Next.js)

**Add to Cart:**
```typescript
const addToCart = async (productId: string, variantId: string, quantity: number) => {
  const sessionId = localStorage.getItem('sessionId') || generateUUID();
  localStorage.setItem('sessionId', sessionId);
  
  const response = await fetch('/api/cart/items', {
    method: 'POST',
    headers: {
      'x-session-id': sessionId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productId, variantId, quantity })
  });
  
  const data = await response.json();
  // Update cart state
};
```

---

## Summary

✅ **Completed:**
- Currency handling (removed, always INR)
- Guest session persistence (7-day expiry)
- Database migration (sessionId for guests)
- Entity updates (nullable userId)
- CartService implementation (variantId support)
- CartController implementation
- WishlistService implementation (full guest support)
- WishlistController implementation
- Price calculation (variant-based multipliers)
- Module registration (AppModule updated)

✅ **Ready for Testing:**
- Mobile app integration
- Web app integration
- Guest flow verification
- Price calculation verification
- Session persistence verification

---

## API Documentation Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/cart` | GET | Get current cart |
| `/cart/items` | POST | Add item to cart |
| `/cart/items/:itemId` | PATCH | Update item quantity |
| `/cart/items/:itemId` | DELETE | Remove item from cart |
| `/cart` | DELETE | Clear entire cart |
| `/wishlist` | GET | Get all wishlist items |
| `/wishlist/check/:productId` | GET | Check if product in wishlist |
| `/wishlist/check/:productId/:variantId` | GET | Check if variant in wishlist |
| `/wishlist` | POST | Add item to wishlist |
| `/wishlist/:productId` | DELETE | Remove product from wishlist |
| `/wishlist/:productId/:variantId` | DELETE | Remove variant from wishlist |
| `/wishlist` | DELETE | Clear entire wishlist |

---

## Files Created/Modified

**Created:**
- `apps/api/src/migrations/1736630000001-AddGuestWishlistAndRemoveCurrency.ts`
- `apps/api/src/wishlist/wishlist.service.ts`
- `apps/api/src/wishlist/wishlist.controller.ts`
- `apps/api/src/wishlist/wishlist.module.ts`

**Modified:**
- `apps/api/src/entities/wishlist.entity.ts` (added sessionId, expiresAt)
- `apps/api/src/entities/cart.entity.ts` (removed currency - already correct)
- `apps/api/src/cart/cart.service.ts` (updated to use variantId)
- `apps/api/src/cart/cart.controller.ts` (updated to use variantId)
- `apps/api/src/cart/cart.module.ts` (added ProductVariant)
- `apps/api/src/app.module.ts` (added WishlistModule)
