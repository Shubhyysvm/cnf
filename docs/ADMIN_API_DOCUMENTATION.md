# Country Natural Foods - Admin Backend API Documentation

**Version**: 1.0.0  
**Last Updated**: 2026-01-15  
**Base URL**: `http://localhost:3001/api`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Admin Users Management](#admin-users-management)
3. [Audit Logs](#audit-logs)
4. [Dashboard](#dashboard)
5. [Admin Settings](#admin-settings)
6. [Sync Manager](#sync-manager)
7. [Product Management](#product-management)
8. [Category Management](#category-management)
9. [Inventory Management](#inventory-management)
10. [Orders & Fulfillment](#orders--fulfillment)
11. [Payments, Refunds & Returns](#payments-refunds--returns)
12. [Coupons & Promotions](#coupons--promotions)
13. [Reviews & Ratings](#reviews--ratings)
14. [Analytics](#analytics)

---

## Authentication

### Admin Login
**Endpoint**: `POST /admin/auth/login`

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-123",
    "email": "admin@example.com",
    "name": "Admin Name",
    "role": "ADMIN",
    "permissions": ["products.view", "products.edit", ...]
  }
}
```

**Headers for All Authenticated Requests**:
```
Authorization: Bearer {access_token}
```

---

## Admin Users Management

### Create Admin User (Super Admin Only)
**Endpoint**: `POST /admin/users`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "ADMIN",
  "permissions": ["products.view", "products.edit"]
}
```

**Response** (201):
```json
{
  "id": "uuid-123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "ADMIN",
  "permissions": ["products.view", "products.edit"],
  "isActive": true,
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

### Get All Admin Users
**Endpoint**: `GET /admin/users`

**Query Parameters**:
- `page` (number, default: 1)
- `pageSize` (number, default: 20)
- `search` (string) - Search by name or email
- `role` (string) - Filter by role (SUPER_ADMIN, ADMIN, EDITOR, VIEWER)
- `isActive` (boolean) - Filter by active status

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid-123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "ADMIN",
      "permissions": ["products.view", ...],
      "isActive": true,
      "lastLogin": "2026-01-15T15:30:00Z",
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

### Get Admin User by ID
**Endpoint**: `GET /admin/users/:id`

**Response** (200): Same as above single user

### Update Admin User
**Endpoint**: `PUT /admin/users/:id`

**Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "EDITOR",
  "isActive": true
}
```

**Response** (200): Updated admin user

### Deactivate Admin User
**Endpoint**: `DELETE /admin/users/:id`

**Response** (200):
```json
{
  "message": "Admin user successfully deactivated"
}
```

### Get Permissions for Role
**Endpoint**: `GET /admin/users/:role/permissions`

**Response** (200):
```json
[
  {
    "permission": "products.view",
    "description": "View all products"
  },
  {
    "permission": "products.create",
    "description": "Create new products"
  }
]
```

### Check Permission
**Endpoint**: `GET /admin/users/:id/has-permission/:permission`

**Response** (200):
```json
{
  "hasPermission": true
}
```

### Grant Permission
**Endpoint**: `POST /admin/users/:id/permissions/grant`

**Request Body**:
```json
{
  "permission": "products.delete"
}
```

### Revoke Permission
**Endpoint**: `POST /admin/users/:id/permissions/revoke`

**Request Body**:
```json
{
  "permission": "products.delete"
}
```

---

## Audit Logs

### Get All Audit Logs
**Endpoint**: `GET /admin/audit-logs`

**Query Parameters**:
- `page` (number, default: 1)
- `pageSize` (number, default: 50)
- `adminId` (string) - Filter by admin
- `action` (string) - Filter by action type
- `resourceType` (string) - Filter by resource type
- `startDate` (ISO date string)
- `endDate` (ISO date string)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid-456",
      "adminId": "uuid-123",
      "action": "CREATE_PRODUCT",
      "resourceType": "product",
      "resourceId": "product-uuid",
      "changes": {
        "name": "New Product",
        "price": 999
      },
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-01-15T10:05:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 50,
  "totalPages": 3
}
```

### Get Audit Logs by Admin
**Endpoint**: `GET /admin/audit-logs/admin/:adminId`

**Query Parameters**:
- `page` (number, default: 1)
- `pageSize` (number, default: 50)

### Get Audit Logs for Resource
**Endpoint**: `GET /admin/audit-logs/resource/:resourceType/:resourceId`

### Get Audit Summary
**Endpoint**: `GET /admin/audit-logs/summary`

**Query Parameters**:
- `startDate` (ISO date string, optional)
- `endDate` (ISO date string, optional)

**Response** (200):
```json
{
  "totalActions": 250,
  "actionBreakdown": [
    {
      "action": "CREATE_PRODUCT",
      "count": 45
    },
    {
      "action": "UPDATE_PRODUCT",
      "count": 120
    },
    {
      "action": "DELETE_PRODUCT",
      "count": 15
    }
  ]
}
```

---

## Dashboard

### Get Comprehensive Dashboard Metrics
**Endpoint**: `GET /admin/dashboard`

**Query Parameters**:
- `period` (string) - 'day', 'week', 'month', 'year' (default: 'month')

**Response** (200):
```json
{
  "kpis": {
    "totalRevenue": 450000,
    "totalOrders": 125,
    "totalProducts": 450,
    "totalCustomers": 2500,
    "totalReviews": 850,
    "averageOrderValue": 3600,
    "orderCompletionRate": 92.5,
    "averageRating": 4.6,
    "revenueGrowth": 15.3,
    "orderGrowth": 8.2
  },
  "revenueTrend": [
    {
      "date": "2026-01-01",
      "revenue": 15000,
      "orders": 5,
      "averageOrderValue": 3000
    }
  ],
  "topProducts": [
    {
      "id": "product-uuid",
      "name": "Organic Honey 500g",
      "slug": "organic-honey-500g",
      "totalSold": 350,
      "revenue": 87500,
      "rating": 4.8
    }
  ],
  "orderStatusBreakdown": {
    "pending": 5,
    "confirmed": 15,
    "shipped": 45,
    "delivered": 55,
    "cancelled": 5
  },
  "customerSegmentation": {
    "newCustomers": 120,
    "returningCustomers": 2380,
    "totalCustomers": 2500,
    "customerRetentionRate": 95.2
  },
  "paymentMethodBreakdown": {
    "razorpay": {
      "count": 85,
      "amount": 300000,
      "percentage": 66.67
    },
    "cod": {
      "count": 40,
      "amount": 150000,
      "percentage": 33.33
    }
  },
  "recentOrders": [...],
  "recentReviews": [...],
  "lastUpdated": "2026-01-15T16:30:00Z"
}
```

### Get KPIs Only
**Endpoint**: `GET /admin/dashboard/kpis`

### Get Revenue Trend
**Endpoint**: `GET /admin/dashboard/revenue-trend`

**Query Parameters**:
- `period` (string) - 'day', 'week', 'month', 'year'

### Get Top Products
**Endpoint**: `GET /admin/dashboard/top-products`

**Query Parameters**:
- `limit` (number, default: 10)

### Get Order Status Breakdown
**Endpoint**: `GET /admin/dashboard/order-status`

### Get Customer Segmentation
**Endpoint**: `GET /admin/dashboard/customer-segmentation`

### Get Payment Methods
**Endpoint**: `GET /admin/dashboard/payment-methods`

### Get Recent Orders
**Endpoint**: `GET /admin/dashboard/recent-orders`

**Query Parameters**:
- `limit` (number, default: 10)

### Get Recent Reviews
**Endpoint**: `GET /admin/dashboard/recent-reviews`

**Query Parameters**:
- `limit` (number, default: 10)

---

## Admin Settings

### Get All Settings
**Endpoint**: `GET /admin/settings`

**Response** (200):
```json
{
  "site_name": "Country Natural Foods",
  "site_description": "Premium organic products",
  "admin_email": "admin@example.com",
  "free_shipping_threshold": 4000,
  "standard_shipping_cost": 500,
  "express_shipping_cost": 150,
  "gst_rate": 8,
  ...
}
```

### Get Settings by Category
**Endpoint**: `GET /admin/settings/category/:category`

**Categories**:
- `general` - General site settings
- `shipping` - Shipping configuration
- `payments` - Payment gateways
- `orders` - Order processing
- `returns` - Returns and refunds
- `inventory` - Stock management
- `email` - Email settings
- `security` - Security settings
- `advanced` - Advanced configuration

**Response** (200):
```json
[
  {
    "definition": {
      "key": "free_shipping_threshold",
      "label": "Free Shipping Threshold (₹)",
      "description": "Orders above this amount get free shipping",
      "type": "number",
      "defaultValue": 4000,
      "validation": { "min": 0 }
    },
    "value": 4000
  }
]
```

### Get Single Setting
**Endpoint**: `GET /admin/settings/:key`

**Response** (200):
```json
{
  "key": "free_shipping_threshold",
  "value": 4000
}
```

### Update Setting
**Endpoint**: `PUT /admin/settings/:key`

**Request Body**:
```json
{
  "value": 5000
}
```

### Update Multiple Settings
**Endpoint**: `PUT /admin/settings`

**Request Body**:
```json
{
  "free_shipping_threshold": 5000,
  "standard_shipping_cost": 600,
  "gst_rate": 9
}
```

### Get Setting Definitions
**Endpoint**: `GET /admin/settings/meta/definitions`

**Response**: Array of all setting definitions

### Get Definitions by Category
**Endpoint**: `GET /admin/settings/meta/definitions/:category`

### Get Categories
**Endpoint**: `GET /admin/settings/meta/categories`

---

## Sync Manager

### Check Product Sync Status
**Endpoint**: `GET /admin/products/:id/images/sync/check`

**Response** (200):
```json
{
  "productId": "uuid-123",
  "orphanedFiles": ["products/uuid/500ml/old-image.jpg"],
  "missingFiles": [],
  "syncedFiles": ["products/uuid/500ml/hero-card/current.jpg"],
  "errors": []
}
```

### Sync Single Product
**Endpoint**: `POST /admin/products/:id/images/sync`

**Request Body**:
```json
{
  "removeOrphaned": true,
  "recreateMissing": true
}
```

### Check All Products Sync
**Endpoint**: `GET /admin/products/sync/check-all`

**Response** (200):
```json
{
  "totalProducts": 450,
  "totalImages": 1350,
  "orphanedFiles": 5,
  "missingFiles": 2,
  "syncedFiles": 1343,
  "errors": 0,
  "results": [...]
}
```

### Sync All Products
**Endpoint**: `POST /admin/products/sync/sync-all`

**Request Body**:
```json
{
  "removeOrphaned": true,
  "recreateMissing": true
}
```

---

## Product Management

### Get All Products (Paginated)
**Endpoint**: `GET /admin/products`

**Query Parameters**:
- `page` (number, default: 1)
- `pageSize` (number, default: 20)
- `search` (string)
- `categoryId` (string)
- `isFeatured` (boolean)
- `isBestSeller` (boolean)
- `isActive` (boolean)
- `sortBy` (string) - Field to sort by
- `order` (string) - 'ASC' or 'DESC'

### Create Product
**Endpoint**: `POST /admin/products`

**Request Body**:
```json
{
  "name": "Organic Honey",
  "slug": "organic-honey",
  "description": "Pure organic honey from local farms",
  "categoryId": "uuid-category",
  "price": 350,
  "isFeatured": true,
  "isBestSeller": false,
  "variants": [
    {
      "weight": "500g",
      "price": 350,
      "sku": "HONEY-500",
      "stockQuantity": 100
    }
  ]
}
```

### Get Product by ID
**Endpoint**: `GET /admin/products/:id`

### Update Product
**Endpoint**: `PATCH /admin/products/:id`

### Delete Product
**Endpoint**: `DELETE /admin/products/:id`

### Bulk Delete Products
**Endpoint**: `POST /admin/products/bulk-delete`

**Request Body**:
```json
{
  "ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

### Upload Product Image
**Endpoint**: `POST /admin/products/:id/images`

**Request**: Form Data
- `file` (multipart file)
- `altText` (string, optional)

### Create Product Variant
**Endpoint**: `POST /admin/products/:id/variants`

### Update Product Variant
**Endpoint**: `PATCH /admin/products/:id/variants/:variantId`

### Delete Product Variant
**Endpoint**: `DELETE /admin/products/:id/variants/:variantId`

---

## Orders & Fulfillment

### Get All Orders
**Endpoint**: `GET /admin/orders`

**Query Parameters**:
- `page` (number)
- `pageSize` (number)
- `status` (string) - pending, confirmed, shipped, delivered, cancelled
- `startDate` (ISO date)
- `endDate` (ISO date)

### Get Order by ID
**Endpoint**: `GET /admin/orders/:id`

### Update Order Status
**Endpoint**: `PATCH /admin/orders/:id/status`

**Request Body**:
```json
{
  "status": "shipped",
  "notes": "Order shipped via XYZ courier"
}
```

### Get Order Status History
**Endpoint**: `GET /admin/orders/:id/status-history`

---

## Payments, Refunds & Returns

### Get All Payments
**Endpoint**: `GET /admin/payments`

**Query Parameters**:
- `page` (number)
- `pageSize` (number)
- `status` (string) - initiated, captured, failed, refunded
- `provider` (string) - razorpay, stripe, paypal, cod

### Get Payment by ID
**Endpoint**: `GET /admin/payments/:id`

### Process Refund
**Endpoint**: `POST /admin/refunds`

**Request Body**:
```json
{
  "paymentId": "uuid-payment",
  "amount": 350,
  "reason": "Product defect",
  "notes": "Customer requested full refund"
}
```

### Get All Returns
**Endpoint**: `GET /admin/returns`

**Query Parameters**:
- `page` (number)
- `status` (string) - initiated, approved, rejected, refunded

### Approve Return
**Endpoint**: `PATCH /admin/returns/:id/approve`

### Reject Return
**Endpoint**: `PATCH /admin/returns/:id/reject`

---

## Coupons & Promotions

### Get All Coupons
**Endpoint**: `GET /admin/coupons`

**Query Parameters**:
- `page` (number)
- `isActive` (boolean)
- `expiryDate` (ISO date)

### Create Coupon
**Endpoint**: `POST /admin/coupons`

**Request Body**:
```json
{
  "code": "WELCOME10",
  "description": "Welcome discount for new customers",
  "discountType": "percentage",
  "discountValue": 10,
  "maxUseCount": 1000,
  "minOrderAmount": 500,
  "expiryDate": "2026-12-31T23:59:59Z",
  "isActive": true
}
```

### Update Coupon
**Endpoint**: `PATCH /admin/coupons/:id`

### Delete Coupon
**Endpoint**: `DELETE /admin/coupons/:id`

---

## Reviews & Ratings

### Get All Reviews
**Endpoint**: `GET /admin/reviews`

**Query Parameters**:
- `page` (number)
- `status` (string) - pending, approved, rejected
- `productId` (string)
- `minRating` (number)
- `maxRating` (number)

### Approve Review
**Endpoint**: `PATCH /admin/reviews/:id/approve`

### Reject Review
**Endpoint**: `PATCH /admin/reviews/:id/reject`

### Delete Review
**Endpoint**: `DELETE /admin/reviews/:id`

---

## Analytics

### Get Search Logs
**Endpoint**: `GET /admin/analytics/search-logs`

**Query Parameters**:
- `page` (number)
- `pageSize` (number)

### Get Add-to-Cart Events
**Endpoint**: `GET /admin/analytics/cart-events`

**Query Parameters**:
- `page` (number)
- `pageSize` (number)

### Get Checkout Abandonments
**Endpoint**: `GET /admin/analytics/checkout-abandonments`

**Query Parameters**:
- `page` (number)
- `pageSize` (number)
- `step` (string) - address, payment, review

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "statusCode": 400,
  "message": "Invalid request",
  "error": "Bad Request"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `500` - Server Error

---

## Rate Limiting

- **API Rate Limit**: 1000 requests/hour per admin user
- **X-RateLimit-Limit**: Total limit
- **X-RateLimit-Remaining**: Remaining requests
- **X-RateLimit-Reset**: Time when limit resets (Unix timestamp)

---

## Pagination

All paginated endpoints follow this format:

```json
{
  "data": [...],
  "total": 250,
  "page": 1,
  "pageSize": 20,
  "totalPages": 13
}
```

---

## Filters & Sorting

### Common Query Parameters:
- `search` - Full-text search across name, description, etc.
- `sortBy` - Field to sort by
- `order` - 'ASC' (ascending) or 'DESC' (descending)
- `page` - Page number (1-indexed)
- `pageSize` - Items per page

---

## Best Practices

1. **Always include Authorization header** for authenticated endpoints
2. **Handle pagination** for large datasets
3. **Log important actions** via audit logs
4. **Validate input data** on the client side
5. **Use appropriate HTTP methods** (GET, POST, PATCH, DELETE)
6. **Check permission responses** before allowing actions
7. **Monitor rate limits** and implement backoff strategies
8. **Cache settings** to avoid excessive API calls

---

## Webhook Events (Future)

Upcoming webhook support for:
- `order.created`
- `order.shipped`
- `payment.completed`
- `return.approved`
- `review.created`

---

## Support & Contact

For API support, contact: api-support@countrynatural.com

---

**API Documentation Version**: 1.0.0  
**Last Updated**: 2026-01-15  
**Status**: Production Ready
