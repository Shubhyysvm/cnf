# Cart & Wishlist API Documentation
**Version:** 1.0  
**Last Updated:** 2026-01-14  
**Base URL:** `http://localhost:3001/api` (development)

---

## 📦 Overview

The Cart and Wishlist APIs provide full support for **guest users** and **authenticated users** with the following features:

- ✅ **Guest Sessions** – 7-day session storage using `x-session-id` header
- ✅ **User Persistence** – Permanent storage for authenticated users
- ✅ **Variant Support** – Product variants (250g, 500g, 1kg, etc.) with dynamic pricing
- ✅ **Session Migration** – Seamlessly merge guest cart/wishlist to user account on login
- ✅ **Duplicate Prevention** – Automatic quantity merging for identical items
- ✅ **Real-time Updates** – All operations return updated cart/wishlist state

---

## 🔑 Authentication Headers

### Required Headers

| Header | Description | Required | Example |
|--------|-------------|----------|---------|
| `x-session-id` | Session identifier for guest or user | ✅ Always | `guest-abc123` or `user-uuid` |
| `x-user-id` | User UUID (for authenticated users) | ⚠️ Optional | `550e8400-e29b-41d4-a716-446655440000` |

### Header Usage Examples

**Guest User (before login):**
```http
x-session-id: guest-20260114-abc123
```

**Authenticated User (after login):**
```http
x-session-id: user-550e8400-e29b-41d4-a716-446655440000
x-user-id: 550e8400-e29b-41d4-a716-446655440000
```

### Generating Session IDs

```typescript
// For guest users (mobile app)
const sessionId = `guest-${Date.now()}-${Math.random().toString(36).substring(7)}`;

// For authenticated users (after login)
const sessionId = `user-${userId}`;
```

---

## 🛒 Cart API

### 1. Get Cart
Retrieve the current cart with all items.

**Endpoint:** `GET /cart`

**Headers:**
```http
x-session-id: guest-abc123
```

**Response (200 OK):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440003",
  "items": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440004",
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "variantId": "660e8400-e29b-41d4-a716-446655440001",
      "productName": "Organic Almonds",
      "productSlug": "organic-almonds",
      "variantWeight": "500g",
      "quantity": 2,
      "price": 899,
      "total": 1798
    }
  ],
  "subtotal": 1798,
  "itemCount": 2,
  "currency": "INR"
}
```

---

### 2. Add Item to Cart
Add a product (with optional variant) to the cart.

**Endpoint:** `POST /cart/items`

**Headers:**
```http
x-session-id: guest-abc123
Content-Type: application/json
```

**Request Body:**
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "variantId": "660e8400-e29b-41d4-a716-446655440001",
  "quantity": 2
}
```

**Field Validation:**
- `productId` – UUID v4 (required)
- `variantId` – UUID v4 (optional, null if no variant)
- `quantity` – Integer between 1-99 (optional, default: 1)

**Response (201 Created):**
Returns the updated cart (same format as GET /cart).

**Error Responses:**
- `400 Bad Request` – Invalid UUID or quantity
- `404 Not Found` – Product or variant doesn't exist

---

### 3. Update Item Quantity
Update the quantity of a specific cart item.

**Endpoint:** `PATCH /cart/items/:itemId`

**Headers:**
```http
x-session-id: guest-abc123
Content-Type: application/json
```

**URL Parameters:**
- `itemId` – Cart item UUID

**Request Body:**
```json
{
  "quantity": 5
}
```

**Response (200 OK):**
Returns the updated cart.

**Error Response:**
- `404 Not Found` – Cart item doesn't exist

---

### 4. Remove Item from Cart
Remove a specific item from the cart.

**Endpoint:** `DELETE /cart/items/:itemId`

**Headers:**
```http
x-session-id: guest-abc123
```

**URL Parameters:**
- `itemId` – Cart item UUID

**Response (200 OK):**
Returns the updated cart.

---

### 5. Clear Cart
Remove all items from the cart.

**Endpoint:** `DELETE /cart`

**Headers:**
```http
x-session-id: guest-abc123
```

**Response (200 OK):**
```json
{
  "message": "Cart cleared successfully",
  "items": [],
  "subtotal": 0,
  "itemCount": 0,
  "currency": "INR"
}
```

---

### 6. Merge Guest Cart to User Cart ⭐
**Call this endpoint immediately after successful login** to migrate guest cart items to the user's account.

**Endpoint:** `POST /cart/merge`

**Headers:**
```http
x-session-id: guest-abc123
x-user-id: 550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
Returns the merged user cart with all items.

**Logic:**
- If user already has the same product+variant, quantities are merged
- If user doesn't have the item, it's added to their cart
- Guest cart is deleted after successful merge

**Mobile Implementation Example:**
```typescript
// After successful login
const response = await fetch('http://localhost:3001/api/cart/merge', {
  method: 'POST',
  headers: {
    'x-session-id': guestSessionId,  // Old guest session
    'x-user-id': user.id,             // User ID from login response
  },
});

// Update session ID for future requests
const newSessionId = `user-${user.id}`;
await AsyncStorage.setItem('sessionId', newSessionId);
```

---

## ❤️ Wishlist API

### 1. Get Wishlist
Retrieve all wishlist items.

**Endpoint:** `GET /wishlist`

**Headers:**
```http
x-session-id: guest-abc123
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440005",
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "productName": "Organic Almonds",
      "productSlug": "organic-almonds",
      "variantId": "660e8400-e29b-41d4-a716-446655440001",
      "variantWeight": "500g",
      "price": 899,
      "addedAt": "2026-01-14T10:30:00Z"
    }
  ],
  "itemCount": 1
}
```

---

### 2. Check if Product is in Wishlist
Check whether a specific product is wishlisted (useful for heart icon state).

**Endpoint:** `GET /wishlist/check/:productId`

**Headers:**
```http
x-session-id: guest-abc123
```

**URL Parameters:**
- `productId` – Product UUID

**Response (200 OK):**
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "isInWishlist": true
}
```

---

### 3. Check if Variant is in Wishlist
Check whether a specific product variant is wishlisted.

**Endpoint:** `GET /wishlist/check/:productId/:variantId`

**Headers:**
```http
x-session-id: guest-abc123
```

**URL Parameters:**
- `productId` – Product UUID
- `variantId` – Variant UUID

**Response (200 OK):**
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "variantId": "660e8400-e29b-41d4-a716-446655440001",
  "isInWishlist": false
}
```

---

### 4. Add Item to Wishlist
Add a product (with optional variant) to the wishlist.

**Endpoint:** `POST /wishlist`

**Headers:**
```http
x-session-id: guest-abc123
Content-Type: application/json
```

**Request Body:**
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "variantId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response (201 Created):**
```json
{
  "message": "Item added to wishlist",
  "items": [ /* array of wishlist items */ ],
  "itemCount": 3
}
```

**Note:** If the item is already in the wishlist, it returns the existing entry (idempotent).

---

### 5. Remove Product from Wishlist
Remove a product (all variants) from the wishlist.

**Endpoint:** `DELETE /wishlist/:productId`

**Headers:**
```http
x-session-id: guest-abc123
```

**URL Parameters:**
- `productId` – Product UUID

**Response (200 OK):**
Returns the updated wishlist.

---

### 6. Remove Variant from Wishlist
Remove a specific product variant from the wishlist.

**Endpoint:** `DELETE /wishlist/:productId/:variantId`

**Headers:**
```http
x-session-id: guest-abc123
```

**URL Parameters:**
- `productId` – Product UUID
- `variantId` – Variant UUID

**Response (200 OK):**
Returns the updated wishlist.

---

### 7. Clear Wishlist
Remove all items from the wishlist.

**Endpoint:** `DELETE /wishlist`

**Headers:**
```http
x-session-id: guest-abc123
```

**Response (200 OK):**
```json
{
  "message": "Wishlist cleared",
  "items": [],
  "itemCount": 0
}
```

---

### 8. Merge Guest Wishlist to User Wishlist ⭐
**Call this endpoint immediately after successful login** to migrate guest wishlist items to the user's account.

**Endpoint:** `POST /wishlist/merge`

**Headers:**
```http
x-session-id: guest-abc123
x-user-id: 550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
Returns the merged user wishlist with all items.

**Logic:**
- If user already has the same product+variant, guest copy is discarded
- If user doesn't have the item, it's added to their wishlist
- Guest wishlist is deleted after successful merge

---

## 🔄 Mobile Integration Flow

### Guest User Flow
```typescript
// 1. Generate session ID on app start
const sessionId = `guest-${Date.now()}-${Math.random().toString(36).substring(7)}`;
await AsyncStorage.setItem('sessionId', sessionId);

// 2. Use session ID for all API calls
const response = await fetch('http://localhost:3001/api/cart', {
  headers: {
    'x-session-id': sessionId,
  },
});
```

### Login Flow (Session Migration)
```typescript
// 1. User logs in successfully
const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
const { user, token } = await loginResponse.json();

// 2. Merge guest cart to user cart
const guestSessionId = await AsyncStorage.getItem('sessionId');
await fetch('http://localhost:3001/api/cart/merge', {
  method: 'POST',
  headers: {
    'x-session-id': guestSessionId,
    'x-user-id': user.id,
  },
});

// 3. Merge guest wishlist to user wishlist
await fetch('http://localhost:3001/api/wishlist/merge', {
  method: 'POST',
  headers: {
    'x-session-id': guestSessionId,
    'x-user-id': user.id,
  },
});

// 4. Update session ID for future requests
const newSessionId = `user-${user.id}`;
await AsyncStorage.setItem('sessionId', newSessionId);
await AsyncStorage.setItem('userId', user.id);
await AsyncStorage.setItem('token', token);
```

### Authenticated User Flow
```typescript
// All subsequent requests use user session ID
const sessionId = await AsyncStorage.getItem('sessionId'); // user-{uuid}
const userId = await AsyncStorage.getItem('userId');

const response = await fetch('http://localhost:3001/api/cart', {
  headers: {
    'x-session-id': sessionId,
    'x-user-id': userId,
    'Authorization': `Bearer ${token}`,
  },
});
```

---

## 📊 Variant Pricing

Each variant in the `product_variants` table has its own `price` column. The API uses the variant price directly:

- **If variant is selected** → Use `product_variant.price`
- **If no variant** → Use `product.price`

This approach provides:
- ✅ **Single source of truth** - Prices managed in database
- ✅ **Flexibility** - Custom pricing per variant (e.g., bulk discounts, limited-time offers)
- ✅ **Discount support** - Each variant can have its own discount/discountPrice
- ✅ **No calculations** - Prices are pre-defined in the database

### Example Pricing Structure

```sql
-- Product: Organic Almonds (base price ₹500)
INSERT INTO products (id, name, price, ...) 
VALUES ('prod-1', 'Organic Almonds', 500, ...);

-- Variants with different prices
INSERT INTO product_variants (id, productId, weight, price, discountPrice, ...)
VALUES 
  ('var-1', 'prod-1', '250g', 250, NULL, ...),    -- ₹250
  ('var-2', 'prod-1', '500g', 450, NULL, ...),    -- ₹450
  ('var-3', 'prod-1', '1kg', 800, 750, ...),      -- ₹800 (or ₹750 on sale)
  ('var-4', 'prod-1', '2kg', 1500, 1299, ...);    -- ₹1500 (or ₹1299 on sale)
```

### Using Discount/DiscountPrice

The `product_variants` table supports promotional pricing:

```typescript
// In your response, you can include both prices
{
  "variantId": "var-3",
  "variantWeight": "1kg",
  "price": 800,           // Regular price
  "discountPrice": 750,   // Sale price (if any)
  "discount": 50,         // Discount amount or percentage
}
```

---

## ⚠️ Error Handling

### Common Error Codes

| Status Code | Description | Example Response |
|-------------|-------------|------------------|
| `400` | Bad Request – Invalid input | `{ "message": "Product ID must be a valid UUID" }` |
| `404` | Not Found – Resource doesn't exist | `{ "message": "Product with ID ... not found" }` |
| `500` | Internal Server Error | `{ "message": "Failed to retrieve cart" }` |

### Mobile Error Handling Example

```typescript
try {
  const response = await fetch('http://localhost:3001/api/cart/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionId,
    },
    body: JSON.stringify({
      productId: selectedProduct.id,
      variantId: selectedVariant?.id,
      quantity: 1,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    Alert.alert('Error', error.message || 'Failed to add item to cart');
    return;
  }

  const cart = await response.json();
  // Update UI with new cart state
} catch (error) {
  Alert.alert('Error', 'Network error. Please try again.');
}
```

---

## 🧪 Testing Endpoints

### Using Thunder Client / Postman

**Test Cart Flow:**
```bash
# 1. Get empty cart
GET http://localhost:3001/api/cart
Headers: x-session-id: guest-test-123

# 2. Add item
POST http://localhost:3001/api/cart/items
Headers: x-session-id: guest-test-123, Content-Type: application/json
Body: {
  "productId": "<uuid>",
  "variantId": "<uuid>",
  "quantity": 2
}

# 3. Update quantity
PATCH http://localhost:3001/api/cart/items/<item-uuid>
Headers: x-session-id: guest-test-123, Content-Type: application/json
Body: { "quantity": 5 }

# 4. Remove item
DELETE http://localhost:3001/api/cart/items/<item-uuid>
Headers: x-session-id: guest-test-123
```

**Test Wishlist Flow:**
```bash
# 1. Add to wishlist
POST http://localhost:3001/api/wishlist
Headers: x-session-id: guest-test-123, Content-Type: application/json
Body: {
  "productId": "<uuid>",
  "variantId": "<uuid>"
}

# 2. Check if wishlisted
GET http://localhost:3001/api/wishlist/check/<product-uuid>
Headers: x-session-id: guest-test-123

# 3. Remove from wishlist
DELETE http://localhost:3001/api/wishlist/<product-uuid>/<variant-uuid>
Headers: x-session-id: guest-test-123
```

---

## 📝 Best Practices

### 1. Session Management
- Generate unique session IDs on app start
- Persist session IDs in AsyncStorage
- Always include `x-session-id` header in requests
- Update session ID after login (use `user-{uuid}` format)

### 2. Optimistic UI Updates
```typescript
// Update UI immediately, then sync with server
const addToCart = async (product, variant) => {
  // Optimistic update
  setCart(prev => [...prev, { product, variant, quantity: 1 }]);
  
  try {
    // Sync with server
    const response = await api.post('/cart/items', { ... });
    setCart(response.items); // Replace with server state
  } catch (error) {
    // Revert on error
    setCart(prevCart);
    Alert.alert('Error', 'Failed to add item');
  }
};
```

### 3. Error Recovery
- Show user-friendly error messages
- Retry failed requests automatically
- Cache cart/wishlist state locally for offline support

### 4. Performance
- Debounce quantity updates (500ms)
- Use React Query for caching and automatic refetching
- Implement pull-to-refresh for cart/wishlist screens

---

## 🚀 Quick Reference

**Cart Endpoints:**
- `GET /cart` – Get cart
- `POST /cart/items` – Add item
- `PATCH /cart/items/:id` – Update quantity
- `DELETE /cart/items/:id` – Remove item
- `DELETE /cart` – Clear cart
- `POST /cart/merge` – Merge guest to user (after login)

**Wishlist Endpoints:**
- `GET /wishlist` – Get wishlist
- `GET /wishlist/check/:productId` – Check if wishlisted
- `GET /wishlist/check/:productId/:variantId` – Check variant
- `POST /wishlist` – Add item
- `DELETE /wishlist/:productId` – Remove product
- `DELETE /wishlist/:productId/:variantId` – Remove variant
- `DELETE /wishlist` – Clear wishlist
- `POST /wishlist/merge` – Merge guest to user (after login)

---

**Need Help?** Contact the backend team or check the Swagger docs at `http://localhost:3001/api-docs` (coming soon).
