# Add-to-Cart Functionality - Detailed Explanation

## 📊 Overview: The Three Tables

Your add-to-cart system has **3 tables** that work together:

1. **`carts`** - Parent cart container
2. **`cart_items`** - Items added to the cart
3. **`add_to_cart_events`** - Analytics & event tracking

Each serves a different purpose. Let me explain in detail.

---

## 🗂️ Table 1: CARTS - The Cart Container

### Purpose
**Container for a user's shopping session** (logged-in or guest)

### Schema
```sql
CREATE TABLE "carts" (
  "id" uuid PRIMARY KEY,              -- Unique cart identifier
  "userId" uuid,                      -- NULL if guest, user ID if logged in
  "sessionId" varchar(100) UNIQUE,    -- Browser session ID (for guests)
  "createdAt" timestamp DEFAULT now(),-- When cart was created
  "updatedAt" timestamp,              -- Last modified time
  "expiresAt" timestamp,              -- Auto-delete after 7 days
  "currency" varchar(3)               -- "INR", "USD", etc.
);
```

### Key Fields Explained

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `id` | uuid | Unique identifier | `550e8400-e29b-41d4-a716-446655440000` |
| `userId` | uuid | Logged-in user (NULL = guest) | `uuid-of-user` or `NULL` |
| `sessionId` | varchar | Browser session identifier (UNIQUE) | `sess_abc123xyz` |
| `createdAt` | timestamp | When user started shopping | `2024-01-10 10:30:45` |
| `updatedAt` | timestamp | Last item added/removed | `2024-01-10 11:45:20` |
| `expiresAt` | timestamp | Auto-cleanup date (7 days) | `2024-01-17 10:30:45` |
| `currency` | varchar | Cart currency | `INR` |

### Real-World Example

**Guest User Scenario:**
```
User opens browser (no login)
↓
Session ID created: "sess_abc123xyz"
↓
Cart created:
{
  id: "550e8400-e29b-41d4...",
  userId: NULL,                    ← Guest (not logged in)
  sessionId: "sess_abc123xyz",     ← Identifies browser
  createdAt: "2024-01-10 10:30:45",
  expiresAt: "2024-01-17 10:30:45" ← Auto-delete in 7 days
}
```

**Logged-in User Scenario:**
```
User logs in
↓
Cart created/retrieved:
{
  id: "550e8400-e29b-41d4...",
  userId: "user-uuid-12345",       ← Logged in user
  sessionId: "sess_abc123xyz",     ← Still tracked for device
  createdAt: "2024-01-10 10:30:45",
  expiresAt: NULL                  ← No expiry (persistent)
}
```

### Why This Design?

✅ **Guest Support**: Users can shop without creating account (sessionId based)  
✅ **User Support**: Logged-in users have persistent carts across devices (userId based)  
✅ **Auto-Cleanup**: Old guest carts auto-delete after 7 days (expiresAt)  
✅ **Currency Tracking**: Multi-currency support for global customers  
✅ **Audit Trail**: Know when cart was created and last modified  

---

## 🛒 Table 2: CART_ITEMS - The Cart Line Items

### Purpose
**Stores individual items added to a cart** (the actual products)

### Schema (AFTER Migration)
```sql
CREATE TABLE "cart_items" (
  "id" uuid PRIMARY KEY,
  "cartId" uuid NOT NULL,              -- Foreign key to carts
  "productId" uuid NOT NULL,           -- Which product
  "variantId" uuid,                    -- Which variant (NEW)
  "quantity" integer DEFAULT 1,        -- How many
  "price" numeric(10,2) NOT NULL,     -- Price at time of adding
  "productName" varchar(255),          -- Denormalized (NEW)
  "variantWeight" varchar(50),         -- e.g., "500ml", "1kg" (NEW)
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp,
  CONSTRAINT "FK_cartId" FOREIGN KEY ("cartId") 
    REFERENCES "carts"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_variantId" FOREIGN KEY ("variantId") 
    REFERENCES "product_variants"("id") ON DELETE SET NULL
);

CREATE INDEX IDX_cart_items_cart_variant ON "cart_items" ("cartId", "variantId");
```

### Key Fields Explained

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `id` | uuid | Unique line item ID | `item-uuid-1` |
| `cartId` | uuid | Which cart this belongs to | `cart-uuid-1` |
| `productId` | uuid | Product being added | `product-uuid-coconut-oil` |
| `variantId` | uuid | Specific variant (NEW) | `variant-uuid-500ml` |
| `quantity` | int | How many of this item | `3` |
| `price` | numeric | Price when added to cart | `299.99` |
| `productName` | varchar | Product name (denormalized) | `"Pure Coconut Oil"` |
| `variantWeight` | varchar | Size/weight display | `"500ml"` |
| `createdAt` | timestamp | When item added to cart | `2024-01-10 10:35:00` |
| `updatedAt` | timestamp | When quantity last changed | `2024-01-10 11:00:00` |

### Real-World Example

**User's Cart with 3 Items:**

```sql
-- Cart in database
SELECT * FROM cart_items WHERE cartId = 'cart-123';

-- Results:
┌────────────────────────────────────────────────────────────┐
│ id       │ cartId  │ productId        │ variantId  │ qty │ price
├──────────┼─────────┼──────────────────┼────────────┼─────┼───────
│ item-1   │ cart-123│ prod-coconut-oil │ var-500ml  │ 2   │ 299
│ item-2   │ cart-123│ prod-quinoa      │ var-1kg    │ 1   │ 599
│ item-3   │ cart-123│ prod-turmeric    │ var-100g   │ 3   │ 199
└────────────────────────────────────────────────────────────┘

User's Cart View:
├─ Pure Coconut Oil (500ml) × 2  = ₹598
├─ Organic Quinoa (1kg) × 1      = ₹599
└─ Wild Turmeric (100g) × 3      = ₹597
                         ─────────
                   Subtotal: ₹1,794
```

### Cascade Delete Behavior

```
If User Deletes Entire Cart:
  DELETE FROM carts WHERE id = 'cart-123'
  ↓
  Automatically deletes ALL related cart_items
  (because of ON DELETE CASCADE)
  ↓
  3 items deleted automatically
```

---

## 📊 Table 3: ADD_TO_CART_EVENTS - Analytics & Tracking

### Purpose
**Records every "add to cart" action for analytics** (separate from actual cart data)

### Schema
```sql
CREATE TABLE "add_to_cart_events" (
  "id" uuid PRIMARY KEY,
  "userId" uuid,                      -- User who added (NULL = guest)
  "sessionId" varchar(255),           -- Browser session
  "productId" uuid NOT NULL,          -- Which product
  "variantId" uuid,                   -- Which variant
  "quantity" integer NOT NULL,        -- How many added
  "createdAt" timestamp DEFAULT now() -- When this happened
);

CREATE INDEX IDX_product_variant ON "add_to_cart_events" ("productId", "variantId");
CREATE INDEX IDX_user ON "add_to_cart_events" ("userId");
```

### Key Fields Explained

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `id` | uuid | Unique event ID | `event-uuid-1` |
| `userId` | uuid | User (NULL = guest) | `user-123` or `NULL` |
| `sessionId` | varchar | Browser session | `sess_xyz789` |
| `productId` | uuid | Product clicked | `prod-coconut-oil` |
| `variantId` | uuid | Variant selected | `var-500ml` |
| `quantity` | int | Quantity added | `2` |
| `createdAt` | timestamp | When action happened | `2024-01-10 10:35:02` |

### Real-World Example

**User Adds to Cart 3 Times:**

```sql
SELECT * FROM add_to_cart_events 
WHERE userId = 'user-123' 
ORDER BY createdAt DESC;

-- Results:
┌──────────┬─────────────────────┬───────────────────┬──────┐
│ time     │ product             │ variant           │ qty  │
├──────────┼─────────────────────┼───────────────────┼──────┤
│ 10:35:02 │ Pure Coconut Oil    │ 500ml (var-500ml) │ 2    │
│ 10:35:45 │ Organic Quinoa      │ 1kg (var-1kg)     │ 1    │
│ 10:36:10 │ Pure Coconut Oil    │ 500ml (var-500ml) │ 3    │ ← Added again!
└──────────┴─────────────────────┴───────────────────┴──────┘

Analytics You Can Get:
- User added Coconut Oil (500ml) twice at 10:35:02 and 10:36:10
- 3 total products viewed in 2 minutes
- Most popular variant: 500ml coconut oil
```

---

## 🔄 How They Work Together - The Flow

### Step-by-Step Flow: Adding to Cart

```
┌─────────────────────────────────────────────────────────────┐
│ USER ADDS COCONUT OIL (500ml), QUANTITY 2 TO CART          │
└─────────────────────────────────────────────────────────────┘

STEP 1: Frontend sends request
┌────────────────────────────────────────────────────────────┐
│ POST /api/cart/items                                       │
│ Headers: {                                                 │
│   "x-session-id": "sess_abc123xyz"                        │
│ }                                                          │
│ Body: {                                                    │
│   "productId": "prod-coconut-oil",                        │
│   "variantId": "var-500ml",                               │
│   "quantity": 2                                           │
│ }                                                          │
└────────────────────────────────────────────────────────────┘
                            ↓
STEP 2: API gets/creates cart (carts table)
┌────────────────────────────────────────────────────────────┐
│ cartService.getOrCreateCart("sess_abc123xyz")             │
│                                                            │
│ Query: SELECT * FROM carts                                │
│        WHERE sessionId = 'sess_abc123xyz'                │
│                                                            │
│ If NOT found → CREATE new cart:                          │
│ {                                                          │
│   id: "cart-uuid-123",                                   │
│   userId: NULL,           ← Guest                        │
│   sessionId: "sess_abc123xyz",                           │
│   createdAt: now(),                                      │
│   expiresAt: now() + 7 days                             │
│ }                                                          │
└────────────────────────────────────────────────────────────┘
                            ↓
STEP 3: Check if item already in cart (cart_items table)
┌────────────────────────────────────────────────────────────┐
│ Find existing item:                                        │
│ SELECT * FROM cart_items                                  │
│ WHERE cartId = 'cart-uuid-123'                           │
│   AND productId = 'prod-coconut-oil'                     │
│   AND variantId = 'var-500ml'                            │
│                                                            │
│ Case A: Item exists → Increment quantity                 │
│   UPDATE cart_items                                       │
│   SET quantity = quantity + 2                            │
│                                                            │
│ Case B: Item doesn't exist → Create new                  │
│   INSERT INTO cart_items {                               │
│     cartId: 'cart-uuid-123',                            │
│     productId: 'prod-coconut-oil',                      │
│     variantId: 'var-500ml',                             │
│     quantity: 2,                                         │
│     price: 299,                                          │
│     productName: 'Pure Coconut Oil',                    │
│     variantWeight: '500ml'                              │
│   }                                                       │
└────────────────────────────────────────────────────────────┘
                            ↓
STEP 4: Record analytics event (add_to_cart_events table)
┌────────────────────────────────────────────────────────────┐
│ INSERT INTO add_to_cart_events {                          │
│   userId: NULL,              ← Guest user                │
│   sessionId: 'sess_abc123xyz',                           │
│   productId: 'prod-coconut-oil',                        │
│   variantId: 'var-500ml',                               │
│   quantity: 2,                                          │
│   createdAt: now()                                      │
│ }                                                         │
│                                                          │
│ Purpose: Track this action for analytics               │
│ - Most added products                                   │
│ - Popular variants                                      │
│ - User behavior patterns                               │
│ - Conversion funnel                                     │
└────────────────────────────────────────────────────────────┘
                            ↓
STEP 5: Return updated cart to frontend
┌────────────────────────────────────────────────────────────┐
│ Response: {                                                │
│   id: 'cart-uuid-123',                                  │
│   items: [                                               │
│     {                                                    │
│       id: 'item-1',                                     │
│       productId: 'prod-coconut-oil',                   │
│       variantId: 'var-500ml',                          │
│       productName: 'Pure Coconut Oil',                │
│       variantWeight: '500ml',                          │
│       quantity: 2,                                     │
│       price: 299,                                      │
│       total: 598  ← (299 × 2)                          │
│     }                                                   │
│   ],                                                    │
│   subtotal: 598,                                       │
│   itemCount: 2                                         │
│ }                                                        │
└────────────────────────────────────────────────────────────┘
                            ↓
STEP 6: Frontend updates UI
User sees cart updated:
  ✓ "Pure Coconut Oil (500ml) × 2" added
  ✓ Subtotal: ₹598
  ✓ Item count: 2 in cart icon
```

---

## 🗺️ Database Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CARTS TABLE                              │
│  id (pk) | userId | sessionId | createdAt | expiresAt      │
│────────────────────────────────────────────────────────────│
│ cart-123 | NULL   | sess_abc  | 10:30:45  | Jan 17        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ 1-to-many
                 │ (One cart has many items)
                 │
┌────────────────┴────────────────────────────────────────────┐
│              CART_ITEMS TABLE                               │
│  id      | cartId   | productId | variantId | quantity      │
├──────────┼──────────┼───────────┼───────────┼───────────┐
│ item-1   │ cart-123 │ prod-oil  │ var-500ml │ 2         │
│ item-2   │ cart-123 │ prod-quin │ var-1kg   │ 1         │
│ item-3   │ cart-123 │ prod-turmeric │ var-100g │ 3      │
└──────────┴──────────┴───────────┴───────────┴───────────┘

┌─────────────────────────────────────────────────────────────┐
│          ADD_TO_CART_EVENTS TABLE (ANALYTICS)               │
│  id      | userId | sessionId | productId | variantId | qty │
├──────────┼────────┼───────────┼───────────┼───────────┼─────┤
│ event-1  | NULL   | sess_abc  | prod-oil  │ var-500ml │ 2   │
│ event-2  | NULL   | sess_abc  │ prod-quin │ var-1kg   │ 1   │
│ event-3  | NULL   | sess_abc  │ prod-tube │ var-100g  │ 3   │
└──────────┴────────┴───────────┴───────────┴───────────┴─────┘
```

---

## 📝 Key Differences Between the Tables

| Aspect | CARTS | CART_ITEMS | ADD_TO_CART_EVENTS |
|--------|-------|-----------|-------------------|
| **Purpose** | Container | Items in cart | Analytics only |
| **Lifespan** | Until checkout | Until removed | Forever (history) |
| **Relationships** | Parent | Child (to carts) | Independent |
| **Quantity** | N/A | Per item | Per event |
| **Price Stored** | No | Yes | No |
| **Deleted on** | User action | Cart delete | Never (audit trail) |
| **Use Case** | Cart management | Display/checkout | Analytics/reports |
| **Sample Query** | "Show me cart" | "What's in cart" | "Most added items" |

---

## 🎯 What Each Table Is Used For

### 1. CARTS Table - Shopping Session Management
```
USE: "Does this user have a cart?"
QUERY: SELECT * FROM carts WHERE sessionId = ?

USE: "Whose cart is this?"
QUERY: SELECT * FROM carts WHERE userId = ? AND expiresAt > now()

USE: "Clean up old guest carts"
QUERY: DELETE FROM carts WHERE expiresAt < now()
```

### 2. CART_ITEMS Table - Cart Display & Checkout
```
USE: "Show me the items in this cart"
QUERY: SELECT ci.*, p.name, p.price 
       FROM cart_items ci
       JOIN products p ON ci.productId = p.id
       WHERE ci.cartId = ?

USE: "What's the total?"
QUERY: SELECT SUM(quantity * price) FROM cart_items 
       WHERE cartId = ?

USE: "Remove an item"
QUERY: DELETE FROM cart_items WHERE id = ? AND cartId = ?
```

### 3. ADD_TO_CART_EVENTS Table - Business Analytics
```
USE: "Top 10 most added products"
QUERY: SELECT productId, COUNT(*) as adds
       FROM add_to_cart_events
       GROUP BY productId
       ORDER BY adds DESC
       LIMIT 10

USE: "Which variants are popular?"
QUERY: SELECT variantId, COUNT(*) as adds
       FROM add_to_cart_events
       WHERE productId = ?
       GROUP BY variantId

USE: "Conversion funnel - what % add to cart vs checkout?"
QUERY: SELECT 
         COUNT(DISTINCT sessionId) as carts_started,
         (SELECT COUNT(DISTINCT sessionId) FROM orders) as orders_completed,
         ROUND(100.0 * (SELECT COUNT(*)) / COUNT(*), 2) as conversion_rate
       FROM add_to_cart_events

USE: "User behavior - how many times did they add items?"
QUERY: SELECT userId, COUNT(*) as add_events
       FROM add_to_cart_events
       WHERE userId = ?
       GROUP BY userId
```

---

## 💡 Real-World Scenarios

### Scenario 1: Guest User Shopping
```
Guest User Journey:
1. Opens website → sessionId created: "sess_xyz"
2. Adds Coconut Oil (500ml) × 2
   - Creates cart with sessionId
   - Adds cart_item (quantity: 2)
   - Records event in add_to_cart_events
   - Cart lives 7 days (expiresAt)

3. Adds Quinoa (1kg) × 1
   - Same cart used
   - New cart_item created
   - Event recorded
   - Cart updated timestamp

4. Leaves browser (doesn't checkout)
   - Cart stays in DB for 7 days
   - Can resume from any device with same sessionId
   - Analytics record preserved forever

5. After 7 days
   - Cleanup job deletes the cart and items
   - But analytics event remains in add_to_cart_events
```

### Scenario 2: Returning User
```
Logged-in User Journey:
1. User logs in → Gets userId from auth
2. Check if cart exists:
   - SELECT FROM carts WHERE userId = 'user-123'
   - If exists: Load existing cart
   - If not: Create new cart (no expiresAt - persistent)

3. Adds multiple items
   - All items linked to same cartId
   - userId set in cart
   - Events record userId (for personalization)

4. Continues shopping later (next day)
   - Cart persists (no expiresAt)
   - Same items still there
   - Can pick up where left off

5. Analytics benefit
   - Can track "user returned after X days"
   - Can see "user's most viewed products"
   - Can personalize recommendations
```

### Scenario 3: Same Product, Different Variants
```
User adds SAME product with DIFFERENT variants:

ADD TO CART: Coconut Oil (500ml) × 2
├─ Creates cart_item-1 with variantId-500ml, qty=2

ADD TO CART: Coconut Oil (1L) × 1
├─ Creates cart_item-2 with variantId-1L, qty=1
│  (NOT added to item-1 because different variant)

RESULT: Cart shows
├─ Pure Coconut Oil (500ml) × 2
└─ Pure Coconut Oil (1L) × 1

ADD TO CART: Coconut Oil (500ml) × 1 again
├─ Updates cart_item-1: qty=2+1=3
│  (Same product + variant = increment quantity)

RESULT: Cart shows
├─ Pure Coconut Oil (500ml) × 3
└─ Pure Coconut Oil (1L) × 1
```

---

## 🔐 Foreign Key Relationships

### Cascade Delete
```
If you DELETE a cart:
  DELETE FROM carts WHERE id = 'cart-123'
  ↓
  Automatically deletes ALL related items:
  DELETE FROM cart_items WHERE cartId = 'cart-123'
  
Reason: ON DELETE CASCADE
  CONSTRAINT "FK_cartId" 
    FOREIGN KEY ("cartId") 
    REFERENCES "carts"("id") ON DELETE CASCADE
```

### Set Null on Variant Delete
```
If you DELETE a product_variant:
  DELETE FROM product_variants WHERE id = 'var-500ml'
  ↓
  Updates cart_items to NULL:
  UPDATE cart_items SET variantId = NULL 
  WHERE variantId = 'var-500ml'
  
Reason: ON DELETE SET NULL
  CONSTRAINT "FK_variantId" 
    FOREIGN KEY ("variantId") 
    REFERENCES "product_variants"("id") ON DELETE SET NULL

Why: Don't delete user's cart if variant becomes unavailable
```

---

## 🚀 API Endpoints Using These Tables

### Cart Operations
```
GET /api/cart
├─ Reads from: carts, cart_items
├─ Returns: Current cart with all items

POST /api/cart/items
├─ Writes to: carts (create if needed), cart_items, add_to_cart_events
├─ Body: { productId, variantId, quantity }
├─ Returns: Updated cart

PATCH /api/cart/items/:itemId
├─ Writes to: cart_items
├─ Updates: Quantity
├─ Returns: Updated cart

DELETE /api/cart/items/:itemId
├─ Deletes from: cart_items
├─ Returns: Updated cart

DELETE /api/cart
├─ Deletes from: cart_items, carts
├─ Returns: Empty response
```

---

## 📊 Migration Updates (Recently Applied)

### What Changed
```
BEFORE (Old cart_items):
└─ variant (varchar) ← String like "500ml"

AFTER (New cart_items):
├─ variantId (uuid) ← Proper reference to product_variants
├─ variantWeight (varchar) ← Denormalized from variant
└─ productName (varchar) ← Denormalized from product

Benefits:
✅ Referential integrity (foreign key)
✅ Can query variant details directly
✅ Prevents orphaned items
✅ Better for JOINs and searches
```

---

## 📚 Summary Table

| Table | Primary Use | Data Type | Lifespan | Example Query |
|-------|-----------|-----------|----------|---------------|
| **carts** | Session mgmt | Container | Session/Persistent | "Get my cart" |
| **cart_items** | Display & checkout | Items | Until removed | "Show items" |
| **add_to_cart_events** | Analytics | Events | Forever | "Most added" |

---

## 🎓 Key Takeaways

1. **CARTS** = Your shopping session container (guest or user)
2. **CART_ITEMS** = What's actually in your cart (products + variants + quantity)
3. **ADD_TO_CART_EVENTS** = History of all add-to-cart actions for analytics

Each serves a different purpose:
- **carts**: "Do I have an active cart?"
- **cart_items**: "What's in my cart right now?"
- **add_to_cart_events**: "What did users add historically?"

Together they create a complete cart system that works for both guest and logged-in users!
