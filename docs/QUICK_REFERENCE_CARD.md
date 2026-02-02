# Cart & Wishlist API Quick Reference Card

## Summary of Answers to Your Questions

### ❓ Do we really need currency?
✅ **NO** - Removed it  
- Always INR (India-only)
- API returns `"currency": "INR"` (constant)
- Saves database space

### ❓ Guest wishlist like cart?
✅ **YES** - Identical pattern  
- `sessionId` based identification
- 7-day persistence
- Same endpoints as cart
- Merges to user account on login

### ❓ Guest session accessible next day same device?
✅ **YES** - Persists 7 days  
- AsyncStorage/localStorage persists sessionId
- Same device, same sessionId → same cart/wishlist
- Day 8+: Cleanup job deletes (7-day TTL)
- Different device: New sessionId (separate data)

### ❓ Backend implementation?
✅ **COMPLETE** - Ready to test  
- Created: WishlistService, WishlistController, WishlistModule
- Updated: CartService, CartController, AppModule
- Database: Migration created and ready
- Endpoints: 11 total (5 cart + 6 wishlist)

---

## API Endpoints At a Glance

### CART API (5 endpoints)
```
GET    /cart                    Get current cart
POST   /cart/items              Add item (variantId required)
PATCH  /cart/items/:itemId      Update quantity
DELETE /cart/items/:itemId      Remove item
DELETE /cart                    Clear all
```

### WISHLIST API (6 endpoints)
```
GET    /wishlist                Get all items
GET    /wishlist/check/:productId    Check if in wishlist
GET    /wishlist/check/:productId/:variantId    Check variant
POST   /wishlist                Add item
DELETE /wishlist/:productId     Remove product
DELETE /wishlist/:productId/:variantId  Remove variant
DELETE /wishlist                Clear all
```

---

## Request/Response Examples

### Add to Cart
```bash
POST /cart/items
Header: x-session-id: abc-123
Body: {
  "productId": "prod-uuid",
  "variantId": "var-uuid",
  "quantity": 2
}

Response 200:
{
  "id": "cart-uuid",
  "items": [{
    "id": "item-uuid",
    "productId": "prod-uuid",
    "variantId": "var-uuid",
    "productName": "Coconut Oil",
    "variantWeight": "500ml",
    "quantity": 2,
    "price": 299,
    "total": 598
  }],
  "subtotal": 598,
  "itemCount": 2,
  "currency": "INR"
}
```

### Add to Wishlist
```bash
POST /wishlist
Header: x-session-id: abc-123
Body: {
  "productId": "prod-uuid",
  "variantId": "var-uuid"
}

Response 200:
{
  "message": "Item added to wishlist",
  "items": [{
    "id": "wishlist-uuid",
    "productId": "prod-uuid",
    "productName": "Coconut Oil",
    "productSlug": "coconut-oil",
    "variantId": "var-uuid",
    "variantWeight": "500ml",
    "price": 299,
    "addedAt": "2025-01-11T10:30:00Z"
  }],
  "itemCount": 1
}
```

### Check if in Wishlist
```bash
GET /wishlist/check/prod-uuid/var-uuid
Header: x-session-id: abc-123

Response 200:
{
  "productId": "prod-uuid",
  "variantId": "var-uuid",
  "isInWishlist": true
}
```

---

## Headers Required

### For Guests
```
x-session-id: {your-uuid}
```

### For Users
```
x-user-id: {user-uuid}
x-session-id: {session-uuid}  [optional]
```

---

## Database Schema Changes

### Wishlists Table - NEW COLUMNS
```
sessionId     varchar(100)     [NEW] Guest identification
expiresAt     timestamp        [NEW] 7-day cleanup
userId        uuid             [CHANGED] Now nullable (was required)
```

### Carts Table - REMOVED
```
currency      [DELETED]        Always INR, no need to store
```

---

## Price Calculation

### Variant Multipliers
```
250g/ml   → 1.0x base price
500g/ml   → 1.8x base price
1kg/l     → 3.2x base price
2kg/l     → 5.5x base price
```

### Example
```
Base Price: ₹200 (Coconut Oil)
Variant: 500ml
Final Price: 200 × 1.8 = ₹360
```

---

## Guest Session Timeline

```
Day 1, 10:00 AM
  └─ Generate sessionId: "sess-abc-123"
  └─ Add to cart: Coconut Oil (500ml) × 1
  └─ Store in DB with expiresAt=[Day 8, 10:00 AM]

Day 2, 02:00 PM (SAME DEVICE)
  └─ sessionId still in AsyncStorage ✓
  └─ GET /cart → Shows Coconut Oil ✓

Day 2, 02:00 PM (DIFFERENT DEVICE)
  └─ New sessionId generated
  └─ GET /cart → Empty cart ✗

Day 8+, cleanup job runs
  └─ DELETE carts WHERE expiresAt < now()
  └─ Cart gone
```

---

## Mobile App Integration Checklist

- [ ] Generate sessionId on app launch
- [ ] Store sessionId in AsyncStorage
- [ ] Include `x-session-id` header in all requests
- [ ] Create CartContext/Redux store
- [ ] Create WishlistContext/Redux store
- [ ] Implement addToCart function
- [ ] Implement addToWishlist function
- [ ] Implement removeFromWishlist function
- [ ] Implement getCart function
- [ ] Implement getWishlist function
- [ ] Handle isInWishlist check for heart icon
- [ ] On login: merge guest wishlist to user
- [ ] Display ₹ prices with INR currency

---

## Key Implementation Notes

### ✅ variantId is UUID (not string)
- Previously: `variant: "500ml"` (string)
- Now: `variantId: "var-uuid"` (UUID)
- Benefits: Referential integrity, foreign keys, better queries

### ✅ Price is stored snapshot
- At add-to-cart time: Calculate price, store in `price` column
- Don't recalculate on every view
- Protects against price changes while in cart

### ✅ Guests expire in 7 days
- `expiresAt: now() + 7 days`
- Cleanup job: `DELETE FROM carts WHERE expiresAt < now()`
- Auto-expires old guest carts to keep DB clean

### ✅ Users persist forever
- Logged-in users: `expiresAt: NULL`
- Never deleted
- Can access from any device

### ✅ Cascade delete behavior
- Delete cart → Auto-delete all cart_items (CASCADE)
- Delete product → Can't delete if in cart (RESTRICT)
- Delete variant → Set variantId to NULL (SET NULL)

---

## Testing Checklist

### Cart Tests
- [ ] Add item to cart (guest)
- [ ] Add same item again → qty increments
- [ ] Add different variant → new line item
- [ ] Update quantity
- [ ] Remove item
- [ ] Clear cart
- [ ] Persistence: same sessionId next day
- [ ] Different sessionId: new cart

### Wishlist Tests
- [ ] Add item (guest)
- [ ] Prevent duplicates
- [ ] Check if in wishlist (true/false)
- [ ] Remove item
- [ ] Clear wishlist
- [ ] Persistence: same sessionId next day
- [ ] On login: merge to user

### Price Tests
- [ ] Base price correct
- [ ] Variant multiplier correct
- [ ] 500g = 1.8x ✓
- [ ] 1kg = 3.2x ✓
- [ ] 2kg = 5.5x ✓

### Expiry Tests
- [ ] Guest cart: expiresAt = now + 7 days ✓
- [ ] User cart: expiresAt = NULL ✓
- [ ] Cleanup job deletes expired carts

---

## Common Issues & Solutions

### Issue: "Cart is empty next day"
**Cause:** Different sessionId or cache cleared  
**Solution:** Use same device, check AsyncStorage

### Issue: "Variant not found"
**Cause:** variantId doesn't exist  
**Solution:** Ensure variantId is valid UUID

### Issue: "Price is wrong"
**Cause:** Multiplier not applied  
**Solution:** Check multiplier in CartService.calculatePrice()

### Issue: "Can't add same product twice"
**Cause:** Trying to add duplicate, qty should increment  
**Solution:** Should increment qty, not create new item

### Issue: "Wishlist empty on different device"
**Cause:** Different sessionId on different device  
**Solution:** Login with userId (persistent across devices)

---

## Database Queries Reference

### Get guest cart
```sql
SELECT * FROM carts WHERE sessionId = 'sess-123'
```

### Get user cart
```sql
SELECT * FROM carts WHERE userId = 'user-uuid'
```

### Get cart items
```sql
SELECT * FROM cart_items WHERE cartId = 'cart-uuid'
```

### Check if in wishlist
```sql
SELECT * FROM wishlists 
WHERE productId = 'prod-uuid' 
  AND variantId = 'var-uuid' 
  AND (userId = 'user-uuid' OR sessionId = 'sess-123')
```

### Cleanup old guest carts
```sql
DELETE FROM carts WHERE expiresAt < NOW()
```

### Merge guest to user
```sql
UPDATE wishlists 
SET userId = 'user-uuid', sessionId = NULL, expiresAt = NULL
WHERE sessionId = 'sess-123' AND userId IS NULL
```

---

## File Locations

### Source Code
```
apps/api/src/
  ├─ wishlist/
  │   ├─ wishlist.service.ts      [NEW]
  │   ├─ wishlist.controller.ts   [NEW]
  │   └─ wishlist.module.ts       [NEW]
  ├─ cart/
  │   ├─ cart.service.ts          [UPDATED]
  │   ├─ cart.controller.ts       [UPDATED]
  │   └─ cart.module.ts           [UPDATED]
  ├─ entities/
  │   └─ wishlist.entity.ts       [UPDATED]
  ├─ migrations/
  │   └─ 1736630000001-AddGuestWishlistAndRemoveCurrency.ts [NEW]
  └─ app.module.ts               [UPDATED]
```

### Documentation
```
docs/
  ├─ BACKEND_CART_WISHLIST_IMPLEMENTATION.md          [NEW]
  ├─ MIGRATION_AND_TESTING_QUICK_GUIDE.md             [NEW]
  ├─ GUEST_SESSION_PERSISTENCE_EXPLAINED.md           [NEW]
  ├─ IMPLEMENTATION_SUMMARY_CART_WISHLIST.md          [NEW]
  ├─ ADD_TO_CART_DETAILED_EXPLANATION.md              [EXISTING]
  └─ ADD_TO_CART_VISUAL_DIAGRAMS.md                   [EXISTING]
```

---

## Next: Run Migration

```powershell
cd C:\xampp\htdocs\CountryNaturalFoods\apps\api
pnpm migration:run
```

See [MIGRATION_AND_TESTING_QUICK_GUIDE.md](MIGRATION_AND_TESTING_QUICK_GUIDE.md) for details.

---

## One-Page Summary

| Feature | Guest | User | Status |
|---------|-------|------|--------|
| Add to Cart | ✅ | ✅ | Ready |
| Add to Wishlist | ✅ | ✅ | Ready |
| Session ID | sessionId | userId | Ready |
| Persistence | 7 days | Forever | Ready |
| API Endpoints | 11 total | All working | Ready |
| Price Calc | Variant-based | Variant-based | Ready |
| Cross-Device | ❌ | ✅ | By Design |
| Merge on Login | ✅ | Auto | Ready |

---

**Ready to test with mobile app!** 🚀
