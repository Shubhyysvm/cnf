import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Between, Not, IsNull } from 'typeorm';
import { Order } from '../entities/order.entity';
import { Product } from '../entities/product.entity';
import { Review } from '../entities/review.entity';
import { User } from '../entities/user.entity';
import { Payment } from '../entities/payment.entity';

export interface DashboardKPIs {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalReviews: number;
  averageOrderValue: number;
  orderCompletionRate: number;
  averageRating: number;
  revenueGrowth: number;
  orderGrowth: number;
}

export interface RevenueTrendData {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface TopProductData {
  id: string;
  name: string;
  slug: string;
  totalSold: number;
  revenue: number;
  rating: number;
}

export interface OrderStatusBreakdown {
  pending: number;
  confirmed: number;
  shipped: number;
  out_for_delivery: number;
  delivered: number;
  cancelled: number;
  [key: string]: number;
}

export interface CustomerSegmentation {
  newCustomers: number;
  returningCustomers: number;
  totalCustomers: number;
  customerRetentionRate: number;
}

export interface PaymentMethodBreakdown {
  [key: string]: {
    count: number;
    amount: number;
    percentage: number;
  };
}

export interface DashboardMetrics {
  kpis: DashboardKPIs;
  revenueTrend: RevenueTrendData[];
  topProducts: TopProductData[];
  orderStatusBreakdown: OrderStatusBreakdown;
  customerSegmentation: CustomerSegmentation;
  paymentMethodBreakdown: PaymentMethodBreakdown;
  recentOrders: any[];
  recentReviews: any[];
  lastUpdated: Date;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(timePeriod: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<DashboardMetrics> {
    try {
      const now = new Date();
      const startDate = this.getStartDate(now, timePeriod);

      const [kpis, revenueTrend, topProducts, orderStatusBreakdown, customerSegmentation, paymentMethodBreakdown, recentOrders, recentReviews] = await Promise.all(
        [
          this.getKPIs(startDate),
          this.getRevenueTrend(startDate, now, timePeriod),
          this.getTopProducts(startDate, 10),
          this.getOrderStatusBreakdown(startDate),
          this.getCustomerSegmentation(startDate),
          this.getPaymentMethodBreakdown(startDate),
          this.getRecentOrders(10),
          this.getRecentReviews(10),
        ]
      );

      return {
        kpis,
        revenueTrend,
        topProducts,
        orderStatusBreakdown,
        customerSegmentation,
        paymentMethodBreakdown,
        recentOrders,
        recentReviews,
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to get dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Get KPIs
   */
  async getKPIs(startDate?: Date): Promise<DashboardKPIs> {
    const now = new Date();
    const previousMonthStartDate = startDate ? new Date(startDate.getTime() - (30 * 24 * 60 * 60 * 1000)) : new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

    // Get current period metrics
    const [currentOrders, previousOrders] = await Promise.all([
      this.orderRepository.find({
        where: startDate ? { createdAt: MoreThan(startDate) } : {},
        relations: ['items'],
      }),
      this.orderRepository.find({
        where: { createdAt: Between(previousMonthStartDate, startDate || now) },
        relations: ['items'],
      }),
    ]);

    // Convert totals to numbers to handle Decimal type from PostgreSQL
    const totalRevenue = currentOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

    const [totalProducts, totalCustomers, totalReviews] = await Promise.all([
      this.productRepository.count({ where: { isActive: true } }),
      this.userRepository.count(),
      this.reviewRepository.count(),
    ]);

    const completedOrders = currentOrders.filter((o) => o.status === 'delivered').length;
    const cancelledOrders = currentOrders.filter((o) => o.status === 'cancelled').length;
    const orderCompletionRate = currentOrders.length > 0 ? (completedOrders / currentOrders.length) * 100 : 0;

    const avgRating = await this.getAverageRating();

    return {
      totalRevenue,
      totalOrders: currentOrders.length,
      totalProducts,
      totalCustomers,
      totalReviews,
      averageOrderValue: currentOrders.length > 0 ? totalRevenue / currentOrders.length : 0,
      orderCompletionRate,
      averageRating: avgRating,
      revenueGrowth: previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0,
      orderGrowth: previousOrders.length > 0 ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0,
    };
  }

  /**
   * Get revenue trend data
   */
  async getRevenueTrend(startDate: Date, endDate: Date, period: 'day' | 'week' | 'month' | 'year'): Promise<RevenueTrendData[]> {
    const orders = await this.orderRepository.find({
      where: { createdAt: Between(startDate, endDate) },
      relations: ['items'],
    });

    const groupedData: Record<string, RevenueTrendData> = {};
    const dateFormat = period === 'day' ? 'YYYY-MM-DD' : period === 'week' ? 'YYYY-Www' : period === 'month' ? 'YYYY-MM' : 'YYYY';

    orders.forEach((order) => {
      const dateKey = this.formatDate(order.createdAt, period);

      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          date: dateKey,
          revenue: 0,
          orders: 0,
          averageOrderValue: 0,
        };
      }

      groupedData[dateKey].revenue += order.total || 0;
      groupedData[dateKey].orders += 1;
      groupedData[dateKey].averageOrderValue = groupedData[dateKey].revenue / groupedData[dateKey].orders;
    });

    return Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get top products by sales
   */
  async getTopProducts(startDate?: Date, limit: number = 10): Promise<TopProductData[]> {
    const orders = await this.orderRepository.find({
      where: startDate ? { createdAt: MoreThan(startDate) } : {},
      relations: ['items', 'items.product'],
    });

    const productStats: Map<string, any> = new Map();

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const productId = item.productId;

        if (!productStats.has(productId)) {
          productStats.set(productId, {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            totalSold: 0,
            revenue: 0,
            rating: item.product.rating || 0,
          });
        }

        const stats = productStats.get(productId);
        stats.totalSold += item.quantity || 0;
        stats.revenue += (item.price || 0) * (item.quantity || 0);
      });
    });

    return Array.from(productStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  /**
   * Get order status breakdown
   */
  async getOrderStatusBreakdown(startDate?: Date): Promise<OrderStatusBreakdown> {
    const orders = await this.orderRepository.find({
      where: startDate ? { createdAt: MoreThan(startDate) } : {},
    });

    const breakdown: OrderStatusBreakdown = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      const status = order.status || 'pending';
      if (status in breakdown) {
        breakdown[status]++;
      }
    });

    return breakdown;
  }

  /**
   * Get customer segmentation
   */
  async getCustomerSegmentation(startDate?: Date): Promise<CustomerSegmentation> {
    const totalCustomers = await this.userRepository.count();

    let newCustomers = 0;
    if (startDate) {
      // Query using createQueryBuilder for date comparison
      newCustomers = await this.userRepository
        .createQueryBuilder('user')
        .where('user.createdAt > :startDate', { startDate })
        .getCount();
    } else {
      newCustomers = totalCustomers;
    }

    const returningCustomers = totalCustomers - newCustomers;

    // Calculate retention rate (customers with multiple orders in period)
    const customersWithMultipleOrders = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.userId')
      .where(startDate ? 'order.createdAt > :startDate' : '1=1', startDate ? { startDate } : {})
      .groupBy('order.userId')
      .having('COUNT(*) > 1')
      .getRawMany();

    const retentionRate = totalCustomers > 0 ? (customersWithMultipleOrders.length / totalCustomers) * 100 : 0;

    return {
      newCustomers,
      returningCustomers,
      totalCustomers,
      customerRetentionRate: retentionRate,
    };
  }

  /**
   * Get payment method breakdown
   */
  async getPaymentMethodBreakdown(startDate?: Date): Promise<PaymentMethodBreakdown> {
    const payments = await this.paymentRepository.find({
      where: startDate ? { createdAt: MoreThan(startDate) } : {},
    });

    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const breakdown: PaymentMethodBreakdown = {};

    payments.forEach((payment) => {
      const method = payment.provider || 'unknown';

      if (!breakdown[method]) {
        breakdown[method] = {
          count: 0,
          amount: 0,
          percentage: 0,
        };
      }

      breakdown[method].count++;
      breakdown[method].amount += payment.amount || 0;
    });

    // Calculate percentages
    Object.keys(breakdown).forEach((method) => {
      breakdown[method].percentage = totalAmount > 0 ? (breakdown[method].amount / totalAmount) * 100 : 0;
    });

    return breakdown;
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(limit: number = 10): Promise<any[]> {
    const orders = await this.orderRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
    
    // Map to ensure proper field names and format
    return orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      total: Number(order.total) || 0,
      status: order.status,
      createdAt: order.createdAt,
    }));
  }

  /**
   * Get recent reviews
   */
  async getRecentReviews(limit: number = 10): Promise<any[]> {
    return this.reviewRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get count of low stock items (variants where stockQuantity <= lowStockThreshold)
   */
  async getLowStockCount(): Promise<number> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.variants', 'variant')
      .where('variant.isActive = :isActive', { isActive: true })
      .andWhere('variant.stockQuantity <= variant.lowStockThreshold')
      .andWhere('variant.lowStockThreshold > 0') // Only count items that have a threshold set
      .select('COUNT(DISTINCT variant.id)', 'count')
      .getRawOne();

    return parseInt(result?.count || '0', 10);
  }

  /**
   * Get average rating across all products
   */
  private async getAverageRating(): Promise<number> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('AVG(product.rating)', 'avg')
      .getRawOne();

    return result?.avg || 0;
  }

  /**
   * Get start date based on period
   */
  private getStartDate(now: Date, period: 'day' | 'week' | 'month' | 'year'): Date {
    const start = new Date(now);

    switch (period) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        break;
    }

    return start;
  }

  /**
   * Format date based on period
   */
  private formatDate(date: Date, period: 'day' | 'week' | 'month' | 'year'): string {
    const pad = (n: number) => n.toString().padStart(2, '0');

    switch (period) {
      case 'day':
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      case 'week': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return `${weekStart.getFullYear()}-W${pad(Math.ceil((date.getDate() - date.getDay() + 1) / 7))}`;
      }
      case 'month':
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
      case 'year':
        return date.getFullYear().toString();
    }
  }
}
