import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { Wishlist } from '../entities/wishlist.entity';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist, Product, ProductVariant])],
  providers: [WishlistService],
  controllers: [WishlistController],
  exports: [WishlistService],
})
export class WishlistModule {}
