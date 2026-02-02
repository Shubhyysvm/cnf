// User/Admin Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'VIEWER';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

export interface AuthError {
  message: string;
  code: string;
}

// Product Types
export interface ProductImage {
  id: string;
  productId: string;
  categoryId?: string;
  categoryName?: string;
  productName: string; // Denormalized for clarity
  variantId?: string; // Link to ProductVariant
  variantWeight?: string; // Denormalized (e.g., "500ml", "1kg")
  imageType?: "hero-card" | "info-card" | "other"; // Image categorization
  imageUrl: string;
  altText?: string;
  fileName: string;

  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  weight: string; // e.g., "500ml", "1kg", "100g" (renamed from 'name' for clarity)
  productName: string; // Denormalized for clarity
  price: number;
  discountPrice?: number;
  discount?: number;
  offer?: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  shelfLife?: string;
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  ingredients?: string;
  price: number;
  soldCount: number;
  badges?: string[];
  sku: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isLatestArrival: boolean;
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  categoryId: string;
  certifications?: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  imageUrl?: string;
  altText?: string;
  displayOrder: number | null;

  sortOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface ProductFilters extends PaginationParams {
  search?: string;
  categoryId?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  priceMin?: number;
  priceMax?: number;
}

// DTO Types
export interface CreateProductDto {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  ingredients?: string;
  price: number;
  sku: string;
  categoryId: string;
  badges?: string[];
  certifications?: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isLatestArrival?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  isActive?: boolean;
}

export interface CreateVariantDto {
  weight: string; // e.g., "500ml", "1kg", "100g" (renamed from 'name' for clarity)
  productName: string; // Denormalized for consistency
  price: number;
  discountPrice?: number;
  discount?: number;
  offer?: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  shelfLife?: string;
}

export interface UpdateVariantDto extends Partial<CreateVariantDto> {}

export interface UploadImageDto {
  altText?: string;
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

// Analytics Types
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  recentOrders: any[];
  topProducts: any[];
}

export interface OrderData {
  id: string;
  orderId: string;
  total: number;
  status: string;
  customerName: string;
  createdAt: string;
}

export interface ProductStats {
  productId: string;
  productName: string;
  viewCount: number;
  orderCount: number;
  revenue: number;
}

// New Admin Types (Schema Extensions)

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  preferences?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type AddressType = 'shipping' | 'billing';
export interface UserAddress {
  id: string;
  userId: string;
  type: AddressType;
  isDefault: boolean;
  recipientName?: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginSession {
  id: string;
  userId?: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  expiresAt?: string;
  revokedAt?: string;
  isRevoked: boolean;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export type PaymentProvider = 'razorpay' | 'stripe' | 'cashfree' | 'cod';
export type PaymentStatus = 'initiated' | 'success' | 'failed' | 'refunded';
export interface PaymentRecord {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paymentIntentId?: string;
  transactionId?: string;
  gatewayResponse?: Record<string, any>;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type RefundStatus = 'initiated' | 'processing' | 'success' | 'failed';
export interface RefundRecord {
  id: string;
  paymentId: string;
  amount: number;
  reason?: string;
  status: RefundStatus;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type InventoryReason = 'order' | 'cancel' | 'return' | 'admin_adjustment';
export type InventoryRefType = 'order' | 'order_item' | 'return' | 'manual';
export interface InventoryMovementRecord {
  id: string;
  variantId: string;
  quantityChange: number;
  reason: InventoryReason;
  referenceType?: InventoryRefType;
  referenceId?: string;
  createdAt: string;
  createdByAdminId?: string;
}

export type ReservationStatus = 'active' | 'expired' | 'converted' | 'released';
export interface InventoryReservationRecord {
  id: string;
  variantId: string;
  cartId?: string;
  orderId?: string;
  quantity: number;
  status: ReservationStatus;
  reservedAt: string;
  expiresAt?: string;
  releasedAt?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type ActorType = 'system' | 'admin' | 'user';
export interface OrderStatusHistoryRecord {
  id: string;
  orderId: string;
  fromStatus?: OrderStatus;
  toStatus: OrderStatus;
  actorType: ActorType;
  actorId?: string;
  note?: string;
  createdAt: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export interface ReviewRecord {
  id: string;
  productId: string;
  variantId?: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export type CouponType = 'flat' | 'percentage';
export interface CouponRecord {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  validFrom?: string;
  validTo?: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCouponRecord {
  id: string;
  orderId: string;
  couponId: string;
  code: string;
  discountApplied: number;
  createdAt: string;
}

export type ReturnStatus = 'initiated' | 'approved' | 'rejected' | 'received' | 'refunded';
export interface ReturnRecord {
  id: string;
  orderItemId: string;
  reason?: string;
  status: ReturnStatus;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchLogRecord {
  id: string;
  userId?: string;
  sessionId?: string;
  query: string;
  resultCount?: number;
  createdAt: string;
}

export interface AddToCartEventRecord {
  id: string;
  userId?: string;
  sessionId?: string;
  productId: string;
  variantId?: string;
  quantity: number;
  createdAt: string;
}

export type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review';
export interface CheckoutAbandonmentRecord {
  id: string;
  cartId: string;
  userId?: string;
  startedAt: string;
  abandonedAt?: string;
  step: CheckoutStep;
  meta?: Record<string, any>;
  createdAt: string;
}

