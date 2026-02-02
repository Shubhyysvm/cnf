import { Controller, Post, Get, Patch, Body, Param, Headers } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus } from '../entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  private formatOrderResponse(order: any) {
    if (!order) return null;
    try {
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId || null,
        sessionId: order.sessionId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingAddress: typeof order.shippingAddress === 'string' 
          ? JSON.parse(order.shippingAddress) 
          : order.shippingAddress,
        billingAddress: typeof order.billingAddress === 'string'
          ? JSON.parse(order.billingAddress)
          : order.billingAddress,
        status: order.status,
        subtotal: parseFloat(order.subtotal),
        shippingCost: parseFloat(order.shippingCost),
        tax: parseFloat(order.tax),
        total: parseFloat(order.total),
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items?.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productSlug: item.productSlug,
          customerName: item.customerName,
          quantity: item.quantity,
          price: parseFloat(item.price),
          total: parseFloat(item.total),
          variantWeight: item.variantWeight,
        })) || [],
      };
    } catch (error) {
      console.error('Error formatting order response:', error, 'Order:', order);
      throw error;
    }
  }

  @Post('checkout')
  async checkout(
    @Headers('x-session-id') sessionId: string,
    @Headers('x-user-id') userId: string,
    @Body() body: any,
  ) {
    try {
      console.log('Checkout request:', { sessionId, userId, hasBody: !!body });
      const isNonProd = process.env.NODE_ENV !== 'production' || process.env.PAYMENT_MODE === 'test';
      
      const result = await this.ordersService.checkoutFromCart(
        sessionId || 'anonymous',
        userId || null,
        body,
        isNonProd,
      );
      
      console.log('Checkout successful, order:', result.order.orderNumber);
      
      return {
        success: true,
        paymentStatus: result.paymentStatus,
        transactionId: result.transactionId,
        orderNumber: result.order.orderNumber,
        order: this.formatOrderResponse(result.order),
        autoCaptured: isNonProd,
      };
    } catch (error) {
      console.error('Error in checkout:', error);
      throw error;
    }
  }

  @Post()
  async createOrder(
    @Headers('x-session-id') sessionId: string,
    @Body() orderData: any,
  ) {
    const order = await this.ordersService.createOrder(
      sessionId || 'anonymous',
      orderData,
    );
    return {
      success: true,
      orderNumber: order.orderNumber,
      order: this.formatOrderResponse(order),
    };
  }

  @Get(':orderNumber')
  async getOrder(@Param('orderNumber') orderNumber: string) {
    // Check if it's a UUID (order ID) or order number
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderNumber);
    const order = isUuid 
      ? await this.ordersService.getOrderById(orderNumber)
      : await this.ordersService.getOrderByNumber(orderNumber);
    return this.formatOrderResponse(order);
  }

  @Get()
  async getOrders(
    @Headers('x-session-id') sessionId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-admin-view') adminView: string,
  ) {
    try {
      console.log('Fetching orders for userId:', userId, 'sessionId:', sessionId, 'adminView:', adminView);
      let orders: any[];
      
      // If adminView header is set, fetch all orders for admin panel
      if (adminView === 'true') {
        console.log('✅ Fetching ALL orders for admin view');
        orders = await this.ordersService.getAllOrders();
      } else if (userId) {
        // User-specific orders
        console.log('Fetching orders for user:', userId);
        orders = await this.ordersService.getOrdersByUserId(userId);
      } else {
        // Session-specific orders
        console.log('Fetching orders for session:', sessionId || 'anonymous');
        orders = await this.ordersService.getOrdersBySession(sessionId || 'anonymous');
      }
      console.log('Orders fetched:', orders?.length || 0);
      
      if (!orders || orders.length === 0) {
        console.log('No orders found, returning empty array');
        return [];
      }
      
      const formattedOrders = orders.map(order => {
        try {
          return this.formatOrderResponse(order);
        } catch (itemError) {
          console.error('Error formatting order:', order.orderNumber, itemError);
          return null;
        }
      }).filter(o => o !== null);
      
      console.log('Formatted orders count:', formattedOrders.length);
      return formattedOrders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  @Patch(':orderId/status')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() body: { status: string; reason?: string },
  ) {
    try {
      // Validate status
      const validStatuses = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
      if (!validStatuses.includes(body.status)) {
        throw new Error(`Invalid status: ${body.status}`);
      }

      const updatedOrder = await this.ordersService.updateOrderStatus(
        orderId,
        body.status as OrderStatus,
        body.reason,
      );

      return {
        success: true,
        order: this.formatOrderResponse(updatedOrder),
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
}
