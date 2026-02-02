import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MobileNavController } from './mobile-nav.controller';
import { MobileNavService } from './mobile-nav.service';
import { User } from '../entities/user.entity';
import { Order } from '../entities/order.entity';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Wishlist } from '../entities/wishlist.entity';
import { NavPreference } from '../entities/nav-preference.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Order,
      Cart,
      CartItem,
      Wishlist,
      NavPreference,
    ]),
  ],
  controllers: [MobileNavController],
  providers: [MobileNavService],
  exports: [MobileNavService],
})
export class MobileNavModule {}
