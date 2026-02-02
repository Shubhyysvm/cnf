# Admin Backend Quick Reference Guide

**Version**: 1.0.0 | **Date**: 2026-01-15

---

## 🚀 Quick Start

### Import & Use Services

```typescript
// In any module that imports AdminUsersModule
import { AdminUsersService } from './admin-users/admin-users.service';
import { DashboardService } from './admin-dashboard/dashboard.service';
import { AdminSettingsService } from './admin-settings/admin-settings.service';
import { AuditLogService } from './audit-log/audit-log.service';

constructor(
  private adminUsersService: AdminUsersService,
  private dashboardService: DashboardService,
  private settingsService: AdminSettingsService,
  private auditLogService: AuditLogService,
) {}
```

---

## 👥 Admin Users & RBAC

### Roles & Permissions Quick Reference

```typescript
enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',  // All permissions
  ADMIN = 'ADMIN',              // Most permissions, no RBAC
  EDITOR = 'EDITOR',            // Create/Edit only
  VIEWER = 'VIEWER'             // View only
}
```

### Common Permission Checks

```typescript
// Check if admin has permission
const hasPermission = await this.adminUsersService.hasPermission(adminId, 'products.delete');

// Get all permissions for role
const permissions = await this.adminUsersService.getPermissionsForRole(AdminRole.EDITOR);

// Create admin with custom permissions
await this.adminUsersService.createAdminUser({
  name: 'Editor Name',
  email: 'editor@example.com',
  password: 'SecurePass123!',
  role: AdminRole.EDITOR,
  permissions: ['products.view', 'products.edit']
}, currentAdminId);
```

### Permission Domains (60+ total)

```
products.*      - product.view, .create, .edit, .delete, .bulk_delete
categories.*    - category.view, .create, .edit, .delete
variants.*      - variant.view, .create, .edit, .delete
inventory.*     - inventory.view, .edit, .bulk_edit
coupons.*       - coupon.view, .create, .edit, .delete
orders.*        - order.view, .edit, .cancel, .refund
reviews.*       - review.view, .moderate, .delete
payments.*      - payment.view, .refund, .capture
returns.*       - return.view, .approve, .reject
refunds.*       - refund.view, .process
analytics.*     - analytics.view, .export
admins.*        - admin.view, .create, .edit, .delete, .manage_roles
settings.*      - settings.view, .edit, .edit_advanced
sync.*          - sync.view, .execute, .execute_full
audit.*         - audit.view
```

---

## 📊 Dashboard & Analytics

### Get KPI Metrics

```typescript
// Get all metrics for a time period
const metrics = await this.dashboardService.getDashboardMetrics('month');

// Get KPIs only
const kpis = await this.dashboardService.getKPIs();

// Access specific metrics
console.log(metrics.kpis.totalRevenue);
console.log(metrics.kpis.averageOrderValue);
console.log(metrics.kpis.orderCompletionRate);
console.log(metrics.topProducts);
console.log(metrics.customerSegmentation);
```

### Dashboard Time Periods

```typescript
// Supported periods
'day'   - Last 24 hours
'week'  - Last 7 days (week starting Sunday)
'month' - Current month (from 1st)
'year'  - Current year (from Jan 1st)
```

### Common Dashboard Queries

```typescript
// Revenue trend
const trend = await this.dashboardService.getRevenueTrend(startDate, endDate, 'month');

// Top 10 products
const topProducts = await this.dashboardService.getTopProducts(undefined, 10);

// Order status breakdown
const statusBreakdown = await this.dashboardService.getOrderStatusBreakdown();

// Customer retention
const segmentation = await this.dashboardService.getCustomerSegmentation();

// Payment methods used
const paymentMethods = await this.dashboardService.getPaymentMethodBreakdown();
```

---

## ⚙️ Settings Management

### Get/Set Settings

```typescript
// Get single setting
const threshold = await this.settingsService.getSetting('free_shipping_threshold');
// Returns: 4000

// Get all settings
const allSettings = await this.settingsService.getAllSettings();

// Get settings by category
const shippingSettings = await this.settingsService.getSettingsByCategory('shipping');

// Update single setting
await this.settingsService.setSetting('free_shipping_threshold', 5000);

// Bulk update
await this.settingsService.updateSettings({
  'free_shipping_threshold': 5000,
  'standard_shipping_cost': 600,
  'gst_rate': 9
});
```

### Setting Categories

```
'general'      - Site name, URLs, emails
'shipping'     - Delivery costs, thresholds, times
'payments'     - Gateway keys, GST rate
'orders'       - Min/max amounts, email settings
'returns'      - Return windows, refund processing
'inventory'    - Stock alerts, auto-replenish
'email'        - SMTP configuration
'security'     - Login attempts, timeout, 2FA
'advanced'     - Maintenance, caching, cache TTL
```

### Setting Keys (30+ available)

```typescript
// General
'site_name'              // string: "Country Natural Foods"
'site_url'               // url: "https://countrynatural.com"
'admin_email'            // email: "admin@example.com"

// Shipping
'free_shipping_threshold'  // number: 4000
'standard_shipping_cost'   // number: 500
'express_shipping_cost'    // number: 150
'standard_delivery_days'   // number: 5
'express_delivery_days'    // number: 2

// Payments
'gst_rate'               // number: 8
'razorpay_key_id'        // text
'stripe_api_key'         // text

// Orders
'min_order_amount'       // number: 100
'max_order_amount'       // number: 0 (unlimited)

// Security
'max_login_attempts'     // number: 5
'session_timeout_minutes'  // number: 30
'enable_two_factor_auth' // boolean: false

// Advanced
'maintenance_mode'       // boolean: false
'cache_enabled'          // boolean: true
'cache_ttl_hours'        // number: 24
```

---

## 📝 Audit Logging

### Log Action

```typescript
await this.auditLogService.logAction({
  adminId: currentAdminId,
  action: 'CREATE_PRODUCT',
  resourceType: 'product',
  resourceId: productId,
  changes: {
    name: 'New Product',
    price: 999,
    category: 'Organic'
  },
  ipAddress: '192.168.1.1',
  userAgent: req.headers['user-agent']
});
```

### Query Audit Logs

```typescript
// Get all logs (paginated)
const logs = await this.auditLogService.getAuditLogs(1, 50);

// Filter by admin
const adminLogs = await this.auditLogService.getAuditLogsByAdmin(adminId);

// Get resource history
const history = await this.auditLogService.getAuditLogsForResource('product', productId);

// Audit summary
const summary = await this.auditLogService.getAuditSummary(startDate, endDate);
```

### Audit Action Types

```
CREATE_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT
CREATE_VARIANT, UPDATE_VARIANT, DELETE_VARIANT
CREATE_COUPON, UPDATE_COUPON, DELETE_COUPON
CREATE_ORDER, UPDATE_ORDER, CANCEL_ORDER
APPROVE_REVIEW, REJECT_REVIEW, DELETE_REVIEW
APPROVE_RETURN, REJECT_RETURN
PROCESS_REFUND
GRANT_PERMISSION, REVOKE_PERMISSION
CREATE_ADMIN_USER, UPDATE_ADMIN_USER, DELETE_ADMIN_USER
UPDATE_SETTING
And many more...
```

---

## 🔗 API Endpoints - One-Line Reference

```bash
# Auth
POST   /admin/auth/login
GET    /admin/auth/me

# Users
GET    /admin/users
POST   /admin/users
GET    /admin/users/:id
PUT    /admin/users/:id
DELETE /admin/users/:id
GET    /admin/users/:role/permissions
GET    /admin/users/:id/has-permission/:permission
POST   /admin/users/:id/permissions/grant
POST   /admin/users/:id/permissions/revoke

# Dashboard
GET    /admin/dashboard
GET    /admin/dashboard/kpis
GET    /admin/dashboard/revenue-trend
GET    /admin/dashboard/top-products
GET    /admin/dashboard/order-status
GET    /admin/dashboard/customer-segmentation
GET    /admin/dashboard/payment-methods
GET    /admin/dashboard/recent-orders
GET    /admin/dashboard/recent-reviews

# Settings
GET    /admin/settings
GET    /admin/settings/:key
PUT    /admin/settings/:key
PUT    /admin/settings
GET    /admin/settings/category/:category
GET    /admin/settings/meta/definitions
GET    /admin/settings/meta/categories

# Audit Logs
GET    /admin/audit-logs
GET    /admin/audit-logs/admin/:adminId
GET    /admin/audit-logs/resource/:resourceType/:resourceId
GET    /admin/audit-logs/summary

# Products
GET    /admin/products
POST   /admin/products
GET    /admin/products/:id
PATCH  /admin/products/:id
DELETE /admin/products/:id

# Sync
GET    /admin/products/:id/images/sync/check
POST   /admin/products/:id/images/sync
GET    /admin/products/sync/check-all
POST   /admin/products/sync/sync-all
```

---

## 🧪 Testing Common Scenarios

### Test RBAC

```typescript
// Create VIEWER and try to create product (should fail)
const viewer = await this.adminUsersService.createAdminUser({
  name: 'Viewer User',
  email: 'viewer@example.com',
  password: 'SecurePass123!',
  role: AdminRole.VIEWER
}, superAdminId);

const hasPermission = await this.adminUsersService.hasPermission(
  viewer.id,
  'products.create'
); // Should be false
```

### Test Dashboard Calculations

```typescript
const metrics = await this.dashboardService.getDashboardMetrics('month');

// Verify calculations
console.assert(
  metrics.kpis.averageOrderValue === metrics.kpis.totalRevenue / metrics.kpis.totalOrders,
  'Average order value calculation incorrect'
);

// Verify trend data
console.assert(
  metrics.revenueTrend.every(t => t.date),
  'All trend entries should have dates'
);
```

### Test Settings Validation

```typescript
try {
  // Should fail: GST rate > 100
  await this.settingsService.setSetting('gst_rate', 101);
} catch (error) {
  console.log(error.message); // "GST Rate must be at most 100"
}

try {
  // Should fail: negative shipping cost
  await this.settingsService.setSetting('standard_shipping_cost', -100);
} catch (error) {
  console.log(error.message); // "Standard Shipping Cost must be at least 0"
}
```

---

## 📋 Response Format Reference

### Paginated Response
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Success Response
```json
{
  "id": "uuid",
  "message": "Operation successful",
  "data": {...}
}
```

---

## 🔑 Common Query Parameters

```
page=1              // Default: 1
pageSize=20         // Default: 20
search=query        // Full-text search
sortBy=createdAt    // Field to sort by
order=DESC          // ASC or DESC
startDate=2026-01-01T00:00:00Z  // ISO format
endDate=2026-01-31T23:59:59Z    // ISO format
```

---

## ⚡ Performance Tips

1. **Use pagination** - Always use page/pageSize for large datasets
2. **Cache settings** - Settings rarely change, cache them in memory
3. **Index audit logs** - Already indexed on adminId, action, createdAt
4. **Batch operations** - Use bulk updates when possible
5. **Filter early** - Filter on database queries, not in memory

---

## 🐛 Debugging Tips

### Enable Logging
```typescript
// In your service
import { Logger } from '@nestjs/common';

private readonly logger = new Logger(YourService.name);

this.logger.log('Message');
this.logger.warn('Warning');
this.logger.error('Error');
```

### Check Audit Trail
```bash
# Get all actions by an admin
curl http://localhost:3001/api/admin/audit-logs/admin/{adminId}

# Get all changes to a product
curl http://localhost:3001/api/admin/audit-logs/resource/product/{productId}
```

### Verify Permissions
```typescript
const hasPermission = await this.adminUsersService.hasPermission(
  adminId,
  'products.edit'
);

if (!hasPermission) {
  throw new ForbiddenException('Insufficient permissions');
}
```

---

## 📚 Documentation Files

- **Full API Docs**: `docs/ADMIN_API_DOCUMENTATION.md`
- **Implementation Guide**: `docs/ADMIN_BACKEND_COMPLETE_GUIDE.md`
- **This Guide**: `docs/ADMIN_BACKEND_QUICK_REFERENCE.md`

---

## 🎯 Next Steps

1. ✅ Review permissions configuration in `src/admin-users/rbac/permissions.ts`
2. ✅ Test all endpoints with Postman/Insomnia
3. ✅ Integrate with frontend admin panel
4. ✅ Set up proper logging and monitoring
5. ✅ Configure rate limiting
6. ✅ Deploy to staging and test thoroughly

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-15  
**Status**: ✅ Production Ready

Happy coding! 🚀
