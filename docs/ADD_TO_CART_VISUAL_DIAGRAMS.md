# Add-to-Cart System - Visual Diagrams & Flow Charts

## 1. System Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Web/Mobile App)                     │
│                                                                   │
│  User clicks "Add to Cart" button                                 │
│  Sends: { productId, variantId, quantity }                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP POST /api/cart/items
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    BACKEND API (NestJS)                          │
│                                                                   │
│  CartController receives request                                 │
│  │                                                               │
│  ├─→ Gets sessionId from headers (x-session-id)                 │
│  │                                                               │
│  └─→ Calls CartService.addItem()                                │
│                                                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐    ┌──────────────┐
│ CARTS TABLE  │     │CART_ITEMS    │    │ADD_TO_CART   │
│              │     │TABLE         │    │EVENTS TABLE  │
│ Container    │     │              │    │              │
│ for session  │     │ Items in     │    │ Analytics &  │
│              │     │ the cart     │    │ Event log    │
│              │     │              │    │              │
│ Check/Create │────→│Add item or   │───→│Record event  │
│ cart         │     │increment qty │    │for analytics │
│              │     │              │    │              │
└──────────────┘     └──────────────┘    └──────────────┘
        │                    │                    │
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             │ Return updated cart
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                   RESPONSE TO FRONTEND                           │
│                                                                   │
│  {                                                               │
│    id: "cart-uuid",                                             │
│    items: [                                                      │
│      {                                                           │
│        id: "item-1",                                            │
│        productId: "prod-uuid",                                  │
│        productName: "Coconut Oil",                              │
│        variantWeight: "500ml",                                  │
│        quantity: 2,                                             │
│        price: 299,                                              │
│        total: 598                                               │
│      }                                                           │
│    ],                                                            │
│    subtotal: 598,                                               │
│    itemCount: 2                                                 │
│  }                                                               │
└───────────────────────────────────────────────────────────────┘
                             │
                             │ Update UI
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                  USER SEES UPDATED CART                          │
│                                                                   │
│  ✓ Cart icon shows "2"                                           │
│  ✓ "Coconut Oil (500ml) × 2" displayed                           │
│  ✓ Total: ₹598 shown                                             │
└───────────────────────────────────────────────────────────────┘
```

---

## 2. Database Relationships Diagram

```
                    PRODUCTS TABLE
                          │
                          │ (has many variants)
                          │
                          ▼
                PRODUCT_VARIANTS TABLE
                (500ml, 1L, 2L sizes)
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
          CART_ITEMS  PRODUCT_IMAGES STOCK_NOTIFICATIONS
          (FK: variantId → product_variants.id)
          (FK: productId → products.id)

              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
            CARTS              ADD_TO_CART_EVENTS
        (Parent of          (Event log - never
         cart_items)         deletes with cart)

RELATIONSHIPS:
  CARTS (1) ──── (M) CART_ITEMS
    │─ CASCADE: Delete cart → Delete items
    │
  PRODUCTS (1) ──── (M) CART_ITEMS
    │─ RESTRICT: Can't delete product if in cart
    │
  PRODUCT_VARIANTS (1) ──── (M) CART_ITEMS
    │─ SET NULL: Delete variant → variantId becomes NULL
    │
  PRODUCT_VARIANTS (1) ──── (M) ADD_TO_CART_EVENTS
    │─ None: Events remain even if variant deleted
```

---

## 3. Cart Item Lifecycle

```
┌────────────────────────────────────────────────────────────────┐
│                    CART ITEM LIFECYCLE                          │
└────────────────────────────────────────────────────────────────┘

STATE 1: PRODUCT NOT IN CART
───────────────────────────
  Cart: { id: "cart-1", items: [] }
  
  User clicks "Add Coconut Oil (500ml) × 2"
  │
  └─→ Check: Is "Coconut Oil 500ml" already in cart?
      Answer: NO
      │
      └─→ ACTION: Create new cart_item
          INSERT INTO cart_items {
            cartId: "cart-1",
            productId: "prod-oil",
            variantId: "var-500ml",
            quantity: 2,
            price: 299,
            productName: "Coconut Oil",
            variantWeight: "500ml"
          }
  
  RESULT: Cart has 1 item

┌─────────────────────────────────────────────────────────────────

STATE 2: PRODUCT+VARIANT ALREADY IN CART
────────────────────────────────────────
  Cart: {
    id: "cart-1",
    items: [
      {
        id: "item-1",
        productId: "prod-oil",
        variantId: "var-500ml",
        quantity: 2,
        price: 299
      }
    ]
  }
  
  User clicks "Add Coconut Oil (500ml) × 3" again
  │
  └─→ Check: Is "Coconut Oil 500ml" already in cart?
      Answer: YES (item-1 exists)
      │
      └─→ ACTION: Increment existing item quantity
          UPDATE cart_items
          SET quantity = quantity + 3  ← (2 + 3 = 5)
          WHERE id = "item-1"
  
  RESULT: Cart still has 1 item, but qty is now 5

┌─────────────────────────────────────────────────────────────────

STATE 3: SAME PRODUCT, DIFFERENT VARIANT
────────────────────────────────────────
  Cart: {
    id: "cart-1",
    items: [
      {
        id: "item-1",
        productId: "prod-oil",
        variantId: "var-500ml",  ← 500ml
        quantity: 5
      }
    ]
  }
  
  User clicks "Add Coconut Oil (1L) × 1"
  │
  └─→ Check: Is "Coconut Oil 1L" already in cart?
      Answer: NO (only 500ml is there, not 1L)
      │
      └─→ ACTION: Create NEW cart_item (different variant)
          INSERT INTO cart_items {
            cartId: "cart-1",
            productId: "prod-oil",  ← Same product!
            variantId: "var-1L",    ← Different variant!
            quantity: 1,
            price: 599
          }
  
  RESULT: Cart now has 2 items
          - Coconut Oil (500ml) × 5
          - Coconut Oil (1L) × 1

┌─────────────────────────────────────────────────────────────────

STATE 4: QUANTITY UPDATE
───────────────────────
  User changes "Coconut Oil (500ml)" quantity from 5 to 3
  │
  └─→ PATCH /api/cart/items/item-1
      { quantity: 3 }
      │
      └─→ ACTION: Update quantity
          UPDATE cart_items
          SET quantity = 3
          WHERE id = "item-1"
  
  RESULT: Cart shows
          - Coconut Oil (500ml) × 3  ← Changed
          - Coconut Oil (1L) × 1

┌─────────────────────────────────────────────────────────────────

STATE 5: REMOVE ITEM
───────────────────
  User clicks "Remove" on "Coconut Oil (500ml)"
  │
  └─→ DELETE /api/cart/items/item-1
      │
      └─→ ACTION: Delete cart_item
          DELETE FROM cart_items
          WHERE id = "item-1"
  
  RESULT: Cart shows only
          - Coconut Oil (1L) × 1

┌─────────────────────────────────────────────────────────────────

STATE 6: EMPTY CART
──────────────────
  User clicks "Remove" on "Coconut Oil (1L)"
  │
  └─→ DELETE /api/cart/items/item-2
      │
      └─→ ACTION: Delete cart_item
          DELETE FROM cart_items
          WHERE id = "item-2"
  
  RESULT: Cart is now EMPTY
          items: []
          subtotal: 0

  Note: Cart record still exists in DB
        (Can add items again)

┌─────────────────────────────────────────────────────────────────

STATE 7: CLEAR CART
──────────────────
  User clicks "Clear Cart" button
  │
  └─→ DELETE /api/cart
      │
      └─→ ACTION: Delete all cart_items first, then cart
          DELETE FROM cart_items WHERE cartId = "cart-1"
          DELETE FROM carts WHERE id = "cart-1"
  
  RESULT: Entire cart deleted from DB
```

---

## 4. Guest vs Logged-in User Flow

```
GUEST USER FLOW
═══════════════════════════════════════════════════════════════

1. User opens app
   └─→ Browser generates sessionId: "sess_abc123xyz"
       (Stored in localStorage)

2. User adds to cart
   ├─→ Check if cart exists:
   │   SELECT * FROM carts WHERE sessionId = 'sess_abc123xyz'
   │
   ├─→ If NOT found:
   │   INSERT INTO carts {
   │     sessionId: 'sess_abc123xyz',
   │     userId: NULL,  ← No user
   │     expiresAt: now() + 7 days
   │   }
   │
   └─→ Add item to cart (same sessionId)

3. User closes browser
   ├─→ sessionId persists in localStorage
   └─→ Can return anytime within 7 days

4. 7 days pass
   └─→ Cleanup job:
       DELETE FROM carts WHERE expiresAt < now()
       → All guest carts auto-deleted
       → BUT events remain in add_to_cart_events forever!


LOGGED-IN USER FLOW
═══════════════════════════════════════════════════════════════

1. User logs in
   ├─→ Auth token issued
   └─→ userId = "user-uuid-123"

2. User adds to cart
   ├─→ Check if cart exists:
   │   SELECT * FROM carts WHERE userId = 'user-uuid-123'
   │
   ├─→ If NOT found:
   │   INSERT INTO carts {
   │     userId: 'user-uuid-123',  ← Associated with user
   │     sessionId: 'sess_xyz',    ← Still tracked
   │     expiresAt: NULL  ← NO expiry (persistent)
   │   }
   │
   └─→ Add item to cart

3. User closes app
   └─→ Cart persists indefinitely
       (No expiresAt date)

4. User logs in again (next day, next month, etc.)
   └─→ Same cart is loaded
       All items still there!

5. Cart sync across devices
   ├─→ Desktop: Login → See my cart
   ├─→ Mobile: Login with same account → See same cart
   └─→ Both devices share the same cartId (userId-based)


KEY DIFFERENCE
──────────────
GUEST: sessionId (device-specific)
       └─→ Expires after 7 days
       └─→ Different device = different cart

LOGGED-IN: userId (account-specific)
           └─→ Never expires
           └─→ Same cart on all devices
```

---

## 5. Analytics Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    ADD_TO_CART_EVENTS FLOW                     │
└────────────────────────────────────────────────────────────────┘

Every time user adds to cart:

Time: 10:35:00
├─→ User adds: Coconut Oil (500ml) × 2
├─→ INSERT into add_to_cart_events {
│     userId: NULL,
│     sessionId: 'sess_abc123xyz',
│     productId: 'prod-oil',
│     variantId: 'var-500ml',
│     quantity: 2,
│     createdAt: 10:35:00
│   }
└─→ Event recorded ✓

Time: 10:35:45
├─→ User adds: Quinoa (1kg) × 1
├─→ INSERT into add_to_cart_events {
│     userId: NULL,
│     sessionId: 'sess_abc123xyz',
│     productId: 'prod-quinoa',
│     variantId: 'var-1kg',
│     quantity: 1,
│     createdAt: 10:35:45
│   }
└─→ Event recorded ✓

Time: 10:36:10
├─→ User adds: Coconut Oil (500ml) × 3 (adds again!)
├─→ INSERT into add_to_cart_events {
│     userId: NULL,
│     sessionId: 'sess_abc123xyz',
│     productId: 'prod-oil',
│     variantId: 'var-500ml',
│     quantity: 3,
│     createdAt: 10:36:10
│   }
└─→ Event recorded ✓


ANALYTICS YOU CAN BUILD
═══════════════════════

1. Most Popular Products
   SELECT productId, COUNT(*) as add_count
   FROM add_to_cart_events
   GROUP BY productId
   ORDER BY add_count DESC
   
   Result:
   └─→ Coconut Oil: 2 times
   └─→ Quinoa: 1 time

2. Most Popular Variants
   SELECT variantId, COUNT(*) as add_count
   FROM add_to_cart_events
   WHERE productId = 'prod-oil'
   GROUP BY variantId
   
   Result:
   └─→ 500ml: 2 times
   └─→ 1L: 0 times

3. User Behavior
   SELECT COUNT(*) as total_adds
   FROM add_to_cart_events
   WHERE sessionId = 'sess_abc123xyz'
   
   Result:
   └─→ User added 3 times in 1 minute
   └─→ High intent customer!

4. Conversion Funnel
   SELECT 
     COUNT(DISTINCT aae.sessionId) as carts_started,
     COUNT(DISTINCT o.id) as orders_completed,
     ROUND(100.0 * COUNT(DISTINCT o.id) / 
           COUNT(DISTINCT aae.sessionId), 2) as conversion_rate
   FROM add_to_cart_events aae
   LEFT JOIN orders o ON aae.sessionId = o.sessionId
   
   Result:
   └─→ 1000 sessions added to cart
   └─→ 250 sessions completed checkout
   └─→ 25% conversion rate

5. Abandoned Carts
   SELECT sessionId, MAX(createdAt) as last_add
   FROM add_to_cart_events
   WHERE createdAt > now() - interval '24 hours'
   EXCEPT
   SELECT sessionId FROM orders
   WHERE createdAt > now() - interval '24 hours'
   
   Result:
   └─→ Session sess_abc123xyz last added 2 hours ago
   └─→ But didn't checkout → ABANDONED!
```

---

## 6. Complete Transaction Flow

```
User Action Timeline:
════════════════════════════════════════════════════════════════

[10:30] User opens website
        ├─ Browser creates sessionId: "sess_xyz"
        └─ No cart created yet

[10:35] User adds "Coconut Oil (500ml)" × 2
        │
        ├─→ POST /api/cart/items
        │   ├─ CartService.getOrCreateCart("sess_xyz")
        │   │  └─ Cart doesn't exist → CREATE
        │   │     INSERT INTO carts {
        │   │       sessionId: "sess_xyz",
        │   │       expiresAt: [7 days later]
        │   │     }
        │   │
        │   ├─ CartService.addItem()
        │   │  └─ Item doesn't exist → CREATE
        │   │     INSERT INTO cart_items {
        │   │       cartId: "cart-123",
        │   │       productId: "prod-oil",
        │   │       variantId: "var-500ml",
        │   │       quantity: 2
        │   │     }
        │   │
        │   └─ Record event:
        │      INSERT INTO add_to_cart_events {
        │        sessionId: "sess_xyz",
        │        productId: "prod-oil",
        │        variantId: "var-500ml",
        │        quantity: 2
        │      }
        │
        └─→ Response: { items: [item], subtotal: 598, itemCount: 2 }

[10:36] User adds "Coconut Oil (500ml)" × 1 (same item)
        │
        ├─→ POST /api/cart/items (same productId + variantId)
        │   ├─ CartService.getOrCreateCart("sess_xyz")
        │   │  └─ Cart EXISTS → LOAD
        │   │
        │   ├─ CartService.addItem()
        │   │  └─ Item EXISTS → UPDATE
        │   │     UPDATE cart_items
        │   │     SET quantity = 2 + 1 = 3
        │   │     WHERE cartId = "cart-123"
        │   │       AND variantId = "var-500ml"
        │   │
        │   └─ Record event:
        │      INSERT INTO add_to_cart_events {
        │        sessionId: "sess_xyz",
        │        productId: "prod-oil",
        │        variantId: "var-500ml",
        │        quantity: 1
        │      }
        │
        └─→ Response: { items: [{qty: 3, total: 897}], subtotal: 897 }

[10:40] User adds "Quinoa (1kg)" × 1 (different product)
        │
        ├─→ POST /api/cart/items (different productId)
        │   ├─ CartService.getOrCreateCart("sess_xyz")
        │   │  └─ Cart EXISTS → LOAD
        │   │
        │   ├─ CartService.addItem()
        │   │  └─ Item doesn't exist → CREATE
        │   │     INSERT INTO cart_items {
        │   │       cartId: "cart-123",
        │   │       productId: "prod-quinoa",
        │   │       variantId: "var-1kg",
        │   │       quantity: 1
        │   │     }
        │   │
        │   └─ Record event:
        │      INSERT INTO add_to_cart_events {
        │        sessionId: "sess_xyz",
        │        productId: "prod-quinoa",
        │        variantId: "var-1kg",
        │        quantity: 1
        │      }
        │
        └─→ Response: { items: [item1, item2], subtotal: 897+599=1496 }

[10:45] User views cart
        │
        ├─→ GET /api/cart
        │   ├─ CartService.getCart("sess_xyz")
        │   │  └─ Load cart with items
        │   │
        │   └─ Calculate totals:
        │      - Coconut Oil (500ml) × 3 = ₹897
        │      - Quinoa (1kg) × 1 = ₹599
        │      - Subtotal = ₹1,496
        │
        └─→ Response: Full cart details

[10:50] User removes "Coconut Oil (500ml)"
        │
        ├─→ DELETE /api/cart/items/item-1
        │   ├─ CartService.removeItem()
        │   │  └─ Delete cart_item
        │   │     DELETE FROM cart_items WHERE id = "item-1"
        │   │
        │   └─ NO event recorded for deletion
        │      (Events only track additions)
        │
        └─→ Response: { items: [item2 only], subtotal: 599 }

[11:00] User leaves without checkout
        │
        └─ Cart remains in DB with expiresAt = 7 days
           Events remain forever for analytics


Database State After:
═══════════════════════════════════════════════════════════════

CARTS:
┌─────────────────────────────────────────┐
│ id      │ sessionId     │ expiresAt      │
├─────────┼───────────────┼────────────────┤
│ cart-123│ sess_xyz      │ [7 days later] │
└─────────────────────────────────────────┘

CART_ITEMS:
┌──────────────────────────────────────────────────────┐
│ id     │ cartId  │ productId    │ variantId  │ qty   │
├────────┼─────────┼──────────────┼────────────┼───────┤
│ item-2 │ cart-123│ prod-quinoa  │ var-1kg    │ 1     │
└──────────────────────────────────────────────────────┘
Note: item-1 deleted

ADD_TO_CART_EVENTS:
┌────────────────────────────────────────────────────────┐
│ id      │ sessionId │ productId    │ variantId │ qty   │
├─────────┼───────────┼──────────────┼───────────┼───────┤
│ event-1 │ sess_xyz  │ prod-oil     │ var-500ml │ 2     │
│ event-2 │ sess_xyz  │ prod-oil     │ var-500ml │ 1     │
│ event-3 │ sess_xyz  │ prod-quinoa  │ var-1kg   │ 1     │
└────────────────────────────────────────────────────────┘
Note: Never deleted, kept for analytics forever!
```

---

## 7. Error Handling & Edge Cases

```
ERROR 1: Product Not Found
─────────────────────────────
POST /api/cart/items
{ productId: "invalid-id", variantId: "...", quantity: 1 }

Response: 404 Not Found
{
  "message": "Product with ID invalid-id not found"
}

Action: ✗ No cart created
        ✗ No item added
        ✗ No event recorded


ERROR 2: Cart Item Not Found (when updating)
─────────────────────────────────────────────
PATCH /api/cart/items/invalid-item-id
{ quantity: 5 }

Response: 404 Not Found
{
  "message": "Cart item with ID invalid-item-id not found"
}

Action: ✗ Quantity not updated


ERROR 3: Quantity = 0 or Negative
──────────────────────────────────
PATCH /api/cart/items/item-1
{ quantity: 0 }

Action: Automatically DELETE the item
        (No error thrown)

PATCH /api/cart/items/item-1
{ quantity: -5 }

Action: Automatically DELETE the item
        (No error thrown)


ERROR 4: Variant Out of Stock
──────────────────────────────
POST /api/cart/items
{ productId: "prod-oil", variantId: "var-500ml", quantity: 100 }

Currently: Does NOT check inventory!
Action: ✓ Item added to cart

Future: Should implement inventory check:
  IF variant.stockQuantity < requested.quantity
    THEN return error "Only X items in stock"
    ELSE allow add


EDGE CASE 1: Same Product, Different Variants
──────────────────────────────────────────────
Cart Items:
├─ Coconut Oil (500ml) × 2
├─ Coconut Oil (1L) × 1
└─ Coconut Oil (2L) × 1

Action: ✓ Allowed
Why: Different variantId values
     → Treated as separate line items


EDGE CASE 2: Adding Item, Cart Expired
────────────────────────────────────────
POST /api/cart/items
sessionId: "sess_old"

Check: SELECT * FROM carts WHERE sessionId = 'sess_old'

If expiresAt < now():
  Action: Create NEW cart (same sessionId)
  Result: Old cart gone, new cart created


EDGE CASE 3: Concurrent Additions (Race Condition)
───────────────────────────────────────────────────
User clicks "Add to Cart" twice simultaneously
(Network lag, double-click, race condition)

Scenario 1: Add Same Variant Twice
  Request 1: Add Coconut Oil × 2
  Request 2: Add Coconut Oil × 2 (simultaneously)
  
  Both might create separate items!
  Result: TWO line items instead of one increment
  
  Mitigation: Use database unique constraint
             Or add request deduplication

Scenario 2: Quantity Update During Add
  User is adding item
  While request is pending, user changes quantity
  
  Race condition → Unexpected quantity
  
  Mitigation: Lock cart during modifications
             Or use optimistic locking
```

---

## Summary Diagram

```
          ┌─────────────────────────────────────┐
          │   USER ACTION: Add to Cart          │
          └──────────────┬──────────────────────┘
                         │
          ┌──────────────▼──────────────┐
          │ Check Session/User          │
          │ (From headers)              │
          └──────────────┬──────────────┘
                         │
          ┌──────────────▼──────────────────┐
          │ Get or Create Cart              │
          │ (From CARTS table)              │
          └──────────────┬──────────────────┘
                         │
          ┌──────────────▼──────────────────────┐
          │ Check if Item Already in Cart       │
          │ (productId + variantId combo)       │
          └──────────────┬──────────────────────┘
                         │
           ┌─────────────┴──────────────┐
           │                            │
      YES  ▼                         NO ▼
    ┌──────────────┐        ┌──────────────────┐
    │ INCREMENT    │        │ CREATE NEW       │
    │ quantity     │        │ cart_item        │
    │ (UPDATE)     │        │ (INSERT)         │
    └──────────────┘        └──────────────────┘
           │                            │
           └──────────┬────────────────┘
                      │
        ┌─────────────▼──────────────┐
        │ Record Event               │
        │ (INSERT add_to_cart_event) │
        │ For Analytics              │
        └─────────────┬──────────────┘
                      │
        ┌─────────────▼──────────────┐
        │ Return Updated Cart        │
        │ to Frontend                │
        └──────────────────────────┘
```

This complete explanation covers all aspects of the add-to-cart system!
