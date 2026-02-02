import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { OrdersModule } from './orders/orders.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { AdminProductsModule } from './admin-products/admin-products.module';
import { AdminCategoriesModule } from './admin-categories/admin-categories.module';
import { AdminCouponsModule } from './admin-coupons/admin-coupons.module';
import { AdminReviewsModule } from './admin-reviews/admin-reviews.module';
import { AdminPaymentsModule } from './admin-payments/admin-payments.module';
import { AdminRefundsModule } from './admin-refunds/admin-refunds.module';
import { AdminReturnsModule } from './admin-returns/admin-returns.module';
import { AdminInventoryModule } from './admin-inventory/admin-inventory.module';
import { AdminOrderStatusHistoryModule } from './admin-order-status-history/admin-order-status-history.module';
import { AdminAnalyticsModule } from './admin-analytics/admin-analytics.module';
import { UsersModule } from './users/users.module';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AdminDashboardModule } from './admin-dashboard/dashboard.module';
import { AdminSettingsModule } from './admin-settings/admin-settings.module';
import { MobileNavModule } from './mobile-nav/mobile-nav.module';
import { EmailModule } from './services/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('database')!,
    }),
    ProductsModule,
    CartModule,
    WishlistModule,
    OrdersModule,
    SiteSettingsModule,
    AuthModule,
    HealthModule,
    AdminAuthModule,
    AdminProductsModule,
    AdminCategoriesModule,
    AdminCouponsModule,
    AdminReviewsModule,
    AdminPaymentsModule,
    AdminRefundsModule,
    AdminReturnsModule,
    AdminInventoryModule,
    AdminOrderStatusHistoryModule,
    AdminAnalyticsModule,
    UsersModule,
    AdminUsersModule,
    AuditLogModule,
    AdminDashboardModule,
    AdminSettingsModule,
    MobileNavModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
