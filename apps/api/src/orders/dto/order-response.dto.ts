import { Exclude } from 'class-transformer';

export class OrderResponseDto {
  id: string;
  orderNumber: string;
  userId?: string;
  sessionId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: any;
  billingAddress?: any;
  status: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItemResponseDto[];
}

export class OrderItemResponseDto {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  productSlug: string;
  customerName?: string;
  quantity: number;
  price: number;
  total: number;
  variantWeight?: string;
}
