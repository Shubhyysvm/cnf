import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderStatusHistory } from '../entities/order-status-history.entity';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { ProductVariant, Product } from '../entities/product.entity';
import { ProductRepository } from '../products/product.repository';
import { SiteSettingsModule } from '../site-settings/site-settings.module';
import { EmailModule } from '../services/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, OrderStatusHistory, Cart, CartItem, ProductVariant, Product]), SiteSettingsModule, EmailModule],
  controllers: [OrdersController],
  providers: [OrdersService, ProductRepository],
  exports: [OrdersService],
})
export class OrdersModule {}
