import { AdminRole } from '../../entities/admin.entity';

export interface PermissionConfig {
  [AdminRole.SUPER_ADMIN]: string[];
  [AdminRole.ADMIN]: string[];
  [AdminRole.MANAGER]: string[];
  [AdminRole.VIEWER]: string[];
}

export const ROLE_PERMISSIONS: PermissionConfig = {
  [AdminRole.SUPER_ADMIN]: [
    // Products
    'products.view',
    'products.create',
    'products.edit',
    'products.delete',
    'products.bulk_delete',
    
    // Categories
    'categories.view',
    'categories.create',
    'categories.edit',
    'categories.delete',
    
    // Variants
    'variants.view',
    'variants.create',
    'variants.edit',
    'variants.delete',
    
    // Inventory
    'inventory.view',
    'inventory.edit',
    'inventory.bulk_edit',
    
    // Coupons & Promotions
    'coupons.view',
    'coupons.create',
    'coupons.edit',
    'coupons.delete',
    
    // Orders
    'orders.view',
    'orders.edit',
    'orders.cancel',
    'orders.refund',
    
    // Reviews & Ratings
    'reviews.view',
    'reviews.moderate',
    'reviews.delete',
    
    // Payments
    'payments.view',
    'payments.refund',
    'payments.capture',
    
    // Returns & Refunds
    'returns.view',
    'returns.approve',
    'returns.reject',
    'refunds.view',
    'refunds.process',
    
    // Analytics
    'analytics.view',
    'analytics.export',
    
    // Admin Management
    'admins.view',
    'admins.create',
    'admins.edit',
    'admins.delete',
    'admins.manage_roles',
    
    // Settings
    'settings.view',
    'settings.edit',
    'settings.edit_advanced',
    
    // Sync Manager
    'sync.view',
    'sync.execute',
    'sync.execute_full',
    
    // Audit Log
    'audit.view',
  ],
  [AdminRole.ADMIN]: [
    // Products (all operations)
    'products.view',
    'products.create',
    'products.edit',
    'products.delete',
    'products.bulk_delete',
    
    // Categories
    'categories.view',
    'categories.create',
    'categories.edit',
    'categories.delete',
    
    // Variants
    'variants.view',
    'variants.create',
    'variants.edit',
    'variants.delete',
    
    // Inventory
    'inventory.view',
    'inventory.edit',
    'inventory.bulk_edit',
    
    // Coupons
    'coupons.view',
    'coupons.create',
    'coupons.edit',
    'coupons.delete',
    
    // Orders
    'orders.view',
    'orders.edit',
    'orders.cancel',
    'orders.refund',
    
    // Reviews
    'reviews.view',
    'reviews.moderate',
    'reviews.delete',
    
    // Payments
    'payments.view',
    'payments.refund',
    
    // Returns & Refunds
    'returns.view',
    'returns.approve',
    'returns.reject',
    'refunds.view',
    'refunds.process',
    
    // Analytics
    'analytics.view',
    'analytics.export',
    
    // Settings (basic)
    'settings.view',
    'settings.edit',
    
    // Sync Manager
    'sync.view',
    'sync.execute',
    
    // Audit Log
    'audit.view',
  ],
  [AdminRole.MANAGER]: [
    // Products (view & edit only)
    'products.view',
    'products.create',
    'products.edit',
    
    // Categories
    'categories.view',
    'categories.create',
    'categories.edit',
    
    // Variants
    'variants.view',
    'variants.create',
    'variants.edit',
    
    // Coupons
    'coupons.view',
    'coupons.create',
    'coupons.edit',
    
    // Orders (view & limited edit)
    'orders.view',
    'orders.edit',
    
    // Reviews
    'reviews.view',
    'reviews.moderate',
    
    // Returns
    'returns.view',
    'returns.approve',
    
    // Analytics
    'analytics.view',
    
    // Settings
    'settings.view',
  ],
  [AdminRole.VIEWER]: [
    // View-only permissions
    'products.view',
    'categories.view',
    'variants.view',
    'inventory.view',
    'coupons.view',
    'orders.view',
    'reviews.view',
    'payments.view',
    'returns.view',
    'refunds.view',
    'analytics.view',
    'settings.view',
    'audit.view',
  ],
};

export const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  'products.view': 'View all products',
  'products.create': 'Create new products',
  'products.edit': 'Edit existing products',
  'products.delete': 'Delete products',
  'products.bulk_delete': 'Bulk delete products',
  
  'categories.view': 'View all categories',
  'categories.create': 'Create new categories',
  'categories.edit': 'Edit existing categories',
  'categories.delete': 'Delete categories',
  
  'variants.view': 'View product variants',
  'variants.create': 'Create product variants',
  'variants.edit': 'Edit product variants',
  'variants.delete': 'Delete product variants',
  
  'inventory.view': 'View inventory levels',
  'inventory.edit': 'Edit inventory levels',
  'inventory.bulk_edit': 'Bulk edit inventory',
  
  'coupons.view': 'View coupons and promotions',
  'coupons.create': 'Create coupons',
  'coupons.edit': 'Edit coupons',
  'coupons.delete': 'Delete coupons',
  
  'orders.view': 'View orders',
  'orders.edit': 'Edit orders',
  'orders.cancel': 'Cancel orders',
  'orders.refund': 'Refund orders',
  
  'reviews.view': 'View reviews and ratings',
  'reviews.moderate': 'Moderate reviews',
  'reviews.delete': 'Delete reviews',
  
  'payments.view': 'View payment information',
  'payments.refund': 'Process refunds',
  'payments.capture': 'Capture payments',
  
  'returns.view': 'View returns',
  'returns.approve': 'Approve returns',
  'returns.reject': 'Reject returns',
  
  'refunds.view': 'View refunds',
  'refunds.process': 'Process refunds',
  
  'analytics.view': 'View analytics',
  'analytics.export': 'Export analytics data',
  
  'admins.view': 'View admin users',
  'admins.create': 'Create admin users',
  'admins.edit': 'Edit admin users',
  'admins.delete': 'Delete admin users',
  'admins.manage_roles': 'Manage admin roles and permissions',
  
  'settings.view': 'View settings',
  'settings.edit': 'Edit basic settings',
  'settings.edit_advanced': 'Edit advanced settings',
  
  'sync.view': 'View sync status',
  'sync.execute': 'Execute sync operations',
  'sync.execute_full': 'Execute full sync operations',
  
  'audit.view': 'View audit logs',
};
