import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderStatusHistory } from '../entities/order-status-history.entity';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { ProductVariant, Product } from '../entities/product.entity';
import { SiteSettingsService } from '../site-settings/site-settings.service';
import { EmailService } from '../services/email.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderStatusHistory)
    private orderStatusHistoryRepository: Repository<OrderStatusHistory>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly siteSettingsService: SiteSettingsService,
    private readonly emailService: EmailService,
  ) {}

  async createOrder(sessionId: string, orderData: any): Promise<Order> {
    // Get cart
    const cart = await this.cartRepository.findOne({
      where: { sessionId },
      relations: ['items', 'items.product'],
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Generate order number: CNF-YYYYMMDD-random alphanumeric (10 chars)
    // Format: CNF-20260117-AB3K9X2M or CNF-TEST-20260117-AB3K9X2M for non-production
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const randomStr = Array.from({ length: 10 }, () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like O, 0, I, 1
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    const isProduction = process.env.NODE_ENV === 'production' && process.env.PAYMENT_MODE !== 'test';
    const orderNumber = isProduction ? `CNF-${dateStr}-${randomStr}` : `CNF-TEST-${dateStr}-${randomStr}`;

    // Calculate totals - get price from product
    const subtotal = cart.items.reduce((sum, item) => {
      const basePrice = Number(item.product?.price || 0);
      const weightMultipliers: Record<string, number> = {
        '250g': 1,
        '500g': 1.8,
        '1kg': 3.2,
        '2kg': 5.5,
      };
      const multiplier = item.variantWeight ? weightMultipliers[item.variantWeight] || 1 : 1;
      const price = basePrice * multiplier;
      return sum + item.quantity * price;
    }, 0);
    const freeShippingThresholdSetting = await this.siteSettingsService.getSetting('freeShippingThreshold');
    const shippingCostSetting = await this.siteSettingsService.getSetting('shippingCost');
    const freeShippingThreshold = freeShippingThresholdSetting ? Number(freeShippingThresholdSetting) : 4000;
    const shippingCostValue = shippingCostSetting ? Number(shippingCostSetting) : 500;
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : shippingCostValue;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    // Create order
    const order = this.orderRepository.create({
      orderNumber,
      sessionId,
      customerName: `${orderData.firstName || 'Customer'} ${orderData.lastName || ''}`.trim(),
      customerEmail: orderData.email,
      customerPhone: orderData.phone,
      shippingAddress: {
        recipientName: `${orderData.firstName || 'Customer'} ${orderData.lastName || ''}`.trim(),
        phone: orderData.phone,
        line1: orderData.address,
        line2: orderData.apartment || '',
        city: orderData.city,
        state: orderData.state,
        zip: orderData.zip,
        country: orderData.country || 'India',
      },
      billingAddress: {
        recipientName: `${orderData.firstName || 'Customer'} ${orderData.lastName || ''}`.trim(),
        phone: orderData.phone,
        line1: orderData.address,
        line2: orderData.apartment || '',
        city: orderData.city,
        state: orderData.state,
        zip: orderData.zip,
        country: orderData.country || 'India',
      },
      status: OrderStatus.PENDING,
      subtotal,
      shippingCost,
      tax,
      total,
      paymentMethod: orderData.paymentMethod || 'card',
      paymentStatus: 'pending',
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    const orderItems = cart.items.map((cartItem) => {
      const basePrice = Number(cartItem.product?.price || 0);
      const weightMultipliers: Record<string, number> = {
        '250g': 1,
        '500g': 1.8,
        '1kg': 3.2,
        '2kg': 5.5,
      };
      const multiplier = cartItem.variantWeight ? weightMultipliers[cartItem.variantWeight] || 1 : 1;
      const price = basePrice * multiplier;
      
      return this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: cartItem.productId,
        variantId: cartItem.variantId || undefined,
        productName: cartItem.product?.name || cartItem.productName,
        productSlug: cartItem.product?.slug || '',
        customerName: savedOrder.customerName,
        quantity: cartItem.quantity,
        price: price,
        total: cartItem.quantity * price,
        variantWeight: cartItem.variantWeight,
      });
    });

    await this.orderItemRepository.save(orderItems);

    // Reduce stock for each variant and increment soldCount for products
    const productSoldCounts = new Map<string, number>();
    
    for (const cartItem of cart.items) {
      if (cartItem.variantId) {
        const variant = await this.productVariantRepository.findOne({
          where: { id: cartItem.variantId },
        });
        
        if (variant) {
          const newStock = Math.max(0, variant.stockQuantity - cartItem.quantity);
          await this.productVariantRepository.update(
            { id: cartItem.variantId },
            { stockQuantity: newStock }
          );
          console.log(`Reduced stock for variant ${variant.weight}: ${variant.stockQuantity} -> ${newStock}`);
        }
      }
      
      // Accumulate sold count for each product
      const productId = cartItem.productId;
      if (productId) {
        const currentCount = productSoldCounts.get(productId) || 0;
        productSoldCounts.set(productId, currentCount + cartItem.quantity);
      }
    }
    
    // Update soldCount for each product
    for (const [productId, quantity] of productSoldCounts.entries()) {
      await this.productRepository.increment(
        { id: productId },
        'soldCount',
        quantity
      );
      console.log(`Incremented soldCount for product ${productId} by ${quantity}`);
    }

    // Clear cart items by deleting them from the database
    if (cart.items && cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
    }

    // Return order with items
    const finalOrder = await this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['items'],
    });
    
    if (!finalOrder) {
      throw new Error('Order not found after creation');
    }

    // Send emails asynchronously (don't wait for them)
    this.sendOrderEmails(finalOrder, orderData.email);
    
    return finalOrder;
  }

  private async sendOrderEmails(order: Order, customerEmail: string): Promise<void> {
    try {
      // Prepare order data for email templates
      const orderDataForEmail = {
        ...order,
        items: order.items || [],
      };

      // Send admin notification
      await this.emailService.sendAdminOrderNotification(orderDataForEmail);

      // Send customer confirmation
      await this.emailService.sendCustomerOrderConfirmation(orderDataForEmail, customerEmail);
    } catch (error) {
      console.error('Error sending order emails:', error);
      // Don't throw - emails are non-critical
    }
  }

  async checkoutFromCart(
    sessionId: string,
    userId: string | null,
    payload: {
      shippingAddress: any;
      billingAddress?: any;
      paymentMethod?: string;
      email?: string;
      phone?: string;
      items?: Array<{
        productId: string;
        variantId?: string;
        productName: string;
        productSlug?: string;
        variantWeight?: string;
        price: number;
        quantity: number;
      }>;
    },
    autoCapture: boolean,
  ): Promise<{ order: Order; transactionId: string; paymentStatus: string }> {
    // Reuse cart-based calculation and order creation. If cart is empty (Buy Now), fall back to payload.items.
    let order: Order;
    try {
      order = await this.createOrder(sessionId, {
        firstName: payload.shippingAddress?.recipientName || 'Customer',
        lastName: '',
        email: payload.email || 'not-provided@example.com',
        phone: payload.phone || payload.shippingAddress?.phone || '',
        address: payload.shippingAddress?.line1,
        apartment: payload.shippingAddress?.line2,
        city: payload.shippingAddress?.city,
        state: payload.shippingAddress?.state,
        zip: payload.shippingAddress?.zip,
        country: payload.shippingAddress?.country || 'India',
        paymentMethod: payload.paymentMethod || 'card',
      });
    } catch (error: any) {
      const isCartEmpty = error?.message === 'Cart is empty';
      const hasPayloadItems = Array.isArray(payload.items) && payload.items.length > 0;
      if (!isCartEmpty || !hasPayloadItems) {
        throw error;
      }

      // Handle Buy Now flow: build order directly from payload.items
      order = await this.createOrderFromItems(sessionId, userId, payload, autoCapture);
    }

    // Patch userId and payment info
    if (userId) {
      order.userId = userId;
    }
    order.paymentMethod = payload.paymentMethod || 'card';
    order.paymentStatus = autoCapture ? 'success' : 'pending';
    order.status = autoCapture ? OrderStatus.CONFIRMED : OrderStatus.PENDING;

    const saved = await this.orderRepository.save(order);
    const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    return {
      order: saved,
      transactionId,
      paymentStatus: saved.paymentStatus,
    };
  }

  private async createOrderFromItems(
    sessionId: string,
    userId: string | null,
    payload: {
      shippingAddress: any;
      billingAddress?: any;
      paymentMethod?: string;
      email?: string;
      phone?: string;
      items?: Array<{
        productId: string;
        variantId?: string;
        productName: string;
        productSlug?: string;
        variantWeight?: string;
        price: number;
        quantity: number;
      }>;
    },
    autoCapture: boolean,
  ): Promise<Order> {
    // Calculate totals from the provided items (Buy Now flow)
    const items = payload.items || [];
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Get settings for shipping/tax
    const [freeShippingThresholdSetting, shippingCostSetting] = await Promise.all([
      this.siteSettingsService.getSetting('FREE_SHIPPING_THRESHOLD'),
      this.siteSettingsService.getSetting('SHIPPING_COST'),
    ]);
    const freeShippingThreshold = freeShippingThresholdSetting ? Number(freeShippingThresholdSetting) : 4000;
    const shippingCostValue = shippingCostSetting ? Number(shippingCostSetting) : 500;
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : shippingCostValue;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    // Build order
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Array.from({ length: 10 }, () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    const isProduction = process.env.NODE_ENV === 'production' && process.env.PAYMENT_MODE !== 'test';
    const orderNumber = isProduction ? `CNF-${dateStr}-${randomStr}` : `CNF-TEST-${dateStr}-${randomStr}`;

    const orderPayload: DeepPartial<Order> = {
      orderNumber,
      sessionId,
      userId: userId || undefined,
      customerName: `${payload.shippingAddress?.recipientName || 'Customer'}`.trim(),
      customerEmail: payload.email || 'not-provided@example.com',
      customerPhone: payload.phone || payload.shippingAddress?.phone || '',
      shippingAddress: payload.shippingAddress,
      billingAddress: payload.billingAddress || payload.shippingAddress,
      status: OrderStatus.PENDING,
      subtotal,
      shippingCost,
      tax,
      total,
      paymentMethod: payload.paymentMethod || 'card',
      paymentStatus: autoCapture ? 'success' : 'pending',
    };

    const order = this.orderRepository.create(orderPayload);

    const savedOrder = await this.orderRepository.save(order);

    // Create order items from payload
    const orderItems = items.map((item) => this.orderItemRepository.create({
      orderId: savedOrder.id,
      productId: item.productId,
      variantId: item.variantId || undefined,
      productName: item.productName,
      productSlug: item.productSlug || '',
      customerName: savedOrder.customerName,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      variantWeight: item.variantWeight,
    }));

    await this.orderItemRepository.save(orderItems);
    
    // Update soldCount for each product (Buy Now flow)
    const productSoldCounts = new Map<string, number>();
    for (const item of items) {
      if (item.productId) {
        const currentCount = productSoldCounts.get(item.productId) || 0;
        productSoldCounts.set(item.productId, currentCount + item.quantity);
      }
    }
    
    for (const [productId, quantity] of productSoldCounts.entries()) {
      await this.productRepository.increment(
        { id: productId },
        'soldCount',
        quantity
      );
      console.log(`[Buy Now] Incremented soldCount for product ${productId} by ${quantity}`);
    }

    const finalOrder = await this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['items'],
    });

    if (!finalOrder) {
      throw new Error('Order not found after creation');
    }

    return finalOrder;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['items'],
    });
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });
  }

  async getOrdersBySession(sessionId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { sessionId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, reason?: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const previousStatus = order.status;
    order.status = status;
    order.updatedAt = new Date();

    const updatedOrder = await this.orderRepository.save(order);

    // Create status history entry
    try {
      await this.orderStatusHistoryRepository.save([
        {
          orderId,
          fromStatus: previousStatus,
          toStatus: status,
          actorType: 'admin',
          note: reason || null,
        } as any,
      ]);
    } catch (historyError) {
      console.error('Failed to create status history entry:', historyError);
      // Don't fail the status update if history logging fails
    }

    console.log(`Order ${order.orderNumber} status updated from ${previousStatus} to ${status}${reason ? ` - Reason: ${reason}` : ''}`);

    return updatedOrder;
  }
}
