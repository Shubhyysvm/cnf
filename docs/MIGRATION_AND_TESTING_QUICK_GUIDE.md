# Quick Start: Run Migration & Test Backend

## 📋 Prerequisites

Make sure you have:
- Docker running (PostgreSQL container)
- NestJS API dependencies installed (`pnpm install` in `apps/api`)
- API running or ready to start

---

## 🚀 Step 1: Run Migration

### From PowerShell in `apps/api` directory:

```powershell
# Make sure you're in the right location
cd C:\xampp\htdocs\CountryNaturalFoods\apps\api

# Run the migration
pnpm migration:run
```

**Expected Output:**
```
9 migrations found
8 already executed
1 new migration detected
[timestamp] query: START TRANSACTION
[timestamp] query: ALTER TABLE "wishlists" ADD COLUMN "sessionId"...
[timestamp] query: ALTER TABLE "wishlists" ADD COLUMN "expiresAt"...
[timestamp] query: ALTER TABLE "wishlists" ALTER COLUMN "userId" DROP NOT NULL
[timestamp] query: CREATE INDEX "IDX_wishlists_session"...
[timestamp] query: CREATE INDEX "IDX_wishlists_session_product_variant"...
[timestamp] query: CREATE UNIQUE INDEX "UQ_wishlists_user_product_variant"...
[timestamp] query: CREATE UNIQUE INDEX "UQ_wishlists_session_product_variant"...
[timestamp] query: ALTER TABLE "carts" DROP COLUMN "currency"...
[timestamp] query: COMMIT

Migration AddGuestWishlistAndRemoveCurrency1736630000001 has been executed successfully
```

---

## ✅ Step 2: Verify Changes

### Verify Wishlists Table:

```powershell
docker exec ts-postgres psql -U countrynaturalfoods -d countrynaturalfoods -c "\d wishlists"
```

**Expected Output:**
```
Table "public.wishlists"
Column         │       Type       │ Nullable
───────────────┼──────────────────┼──────────
id             │ uuid             │ not null
userId         │ uuid             │ yes       ← NOW NULLABLE ✓
sessionId      │ character varying│ yes       ← NEW FIELD ✓
productId      │ uuid             │ not null
variantId      │ uuid             │ yes
createdAt      │ timestamp        │ not null
expiresAt      │ timestamp        │ yes       ← NEW FIELD ✓
```

### Verify Carts Table:

```powershell
docker exec ts-postgres psql -U countrynaturalfoods -d countrynaturalfoods -c "\d carts"
```

**Expected Output:**
```
Table "public.carts"
Column     │       Type       │ Nullable
────────────┼──────────────────┼──────────
id         │ uuid             │ not null
userId     │ uuid             │ yes
sessionId  │ character varying│ not null
createdAt  │ timestamp        │ not null
updatedAt  │ timestamp        │ not null
expiresAt  │ timestamp        │ yes

Indexes:
    "PK_..." PRIMARY KEY (id)
    "UQ_..." UNIQUE (sessionId)
    
← NO currency column ✓
```

---

## 🧪 Step 3: Test API Endpoints

### Test with Postman or cURL

#### 1. Add Item to Cart (Guest)

```bash
curl -X POST http://localhost:3001/cart/items \
  -H "x-session-id: test-session-123" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "YOUR_PRODUCT_UUID",
    "variantId": "YOUR_VARIANT_UUID",
    "quantity": 2
  }'
```

**Expected Response:**
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

#### 2. Get Cart

```bash
curl -X GET http://localhost:3001/cart \
  -H "x-session-id: test-session-123"
```

**Expected Response:** Same as above

#### 3. Add to Wishlist (Guest)

```bash
curl -X POST http://localhost:3001/wishlist \
  -H "x-session-id: test-session-123" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "YOUR_PRODUCT_UUID",
    "variantId": "YOUR_VARIANT_UUID"
  }'
```

**Expected Response:**
```json
{
  "message": "Item added to wishlist",
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

#### 4. Get Wishlist

```bash
curl -X GET http://localhost:3001/wishlist \
  -H "x-session-id: test-session-123"
```

#### 5. Check if Product in Wishlist

```bash
curl -X GET http://localhost:3001/wishlist/check/YOUR_PRODUCT_UUID/YOUR_VARIANT_UUID \
  -H "x-session-id: test-session-123"
```

**Expected Response:**
```json
{
  "productId": "YOUR_PRODUCT_UUID",
  "variantId": "YOUR_VARIANT_UUID",
  "isInWishlist": true
}
```

#### 6. Remove from Wishlist

```bash
curl -X DELETE http://localhost:3001/wishlist/YOUR_PRODUCT_UUID/YOUR_VARIANT_UUID \
  -H "x-session-id: test-session-123"
```

---

## 🔄 Step 4: Test Guest Session Persistence

### Simulate Multi-Session Access

```powershell
# First request - add to cart
$headers = @{"x-session-id" = "persistent-session-123"}
Invoke-WebRequest -Uri "http://localhost:3001/cart/items" `
  -Method POST `
  -Headers $headers `
  -ContentType "application/json" `
  -Body '{"productId":"PROD_ID","variantId":"VAR_ID","quantity":2}'

# Second request - same sessionId (simulates next day)
Invoke-WebRequest -Uri "http://localhost:3001/cart" `
  -Method GET `
  -Headers $headers

# Expected: Same items in cart ✓
```

---

## 🔙 Step 5: If You Need to Rollback

```powershell
cd C:\xampp\htdocs\CountryNaturalFoods\apps\api

# Rollback the last migration
pnpm migration:revert

# Verify changes are reversed
docker exec ts-postgres psql -U countrynaturalfoods -d countrynaturalfoods -c "\d wishlists"
```

---

## 📝 What Was Changed

### Database
- ✅ Wishlists: Added `sessionId`, `expiresAt`, made `userId` nullable
- ✅ Carts: Removed `currency` column
- ✅ Created indexes for performance on guest wishlists
- ✅ Created unique constraints for both user and guest wishlists

### Backend Code
- ✅ Created WishlistService with full guest support
- ✅ Created WishlistController with 7 endpoints
- ✅ Created WishlistModule
- ✅ Updated CartService to use variantId (UUID)
- ✅ Updated CartController to use variantId
- ✅ Updated CartModule to include ProductVariant
- ✅ Updated AppModule to register WishlistModule

### All Endpoints
- ✅ Cart API: `/cart`, `/cart/items`, etc.
- ✅ Wishlist API: `/wishlist`, `/wishlist/check/:id`, etc.
- ✅ Support for guests (sessionId) and users (userId)
- ✅ Currency always INR (no database storage needed)

---

## 📱 For Mobile App Testing

Use these headers:
```
x-session-id: YOUR_GENERATED_UUID  (store in AsyncStorage)
x-user-id: USER_UUID               (set after login, optional)
```

**Example Flow:**
1. Generate sessionId on app launch
2. Save to AsyncStorage
3. Send in every request header
4. Same sessionId = same cart/wishlist
5. Persists for 7 days

---

## ✨ You're Ready!

The backend is fully implemented and ready for mobile/web testing. All endpoints support both guests and authenticated users with proper data persistence.

See `BACKEND_CART_WISHLIST_IMPLEMENTATION.md` for complete API documentation.
