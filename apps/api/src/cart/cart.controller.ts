import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiHeader,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('Cart')
@Controller('cart')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Extract session ID from headers
   */
  private getSessionId(headers: any): string {
    const sessionId = headers['x-session-id'];
    if (!sessionId) {
      throw new BadRequestException(
        'Session ID is required. Please provide x-session-id header.',
      );
    }
    return sessionId;
  }

  /**
   * Extract user ID from headers (optional, for authenticated users)
   */
  private getUserId(headers: any): string | null {
    const userId = headers['x-user-id'] || null;
    console.log('[CartController.getUserId] Accessing header x-user-id:', userId);
    console.log('[CartController.getUserId] All header keys:', Object.keys(headers));
    return userId;
  }

  /**
   * GET /cart - Get current cart
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getCart(@Headers() headers: any) {
    try {
      const sessionId = this.getSessionId(headers);
      const cart = await this.cartService.getCart(sessionId);

      console.log('=== CART API DEBUG ===');
      console.log('Cart items count:', cart.items?.length || 0);
      if (cart.items && cart.items.length > 0) {
        const firstItem = cart.items[0];
        console.log('First item product images:', firstItem.product?.images?.length || 0);
        if (firstItem.product?.images?.length > 0) {
          console.log('Sample image:', firstItem.product.images[0]);
        }
      }
      console.log('=== END DEBUG ===\n');

      const items =
        cart.items?.map((item) => ({
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          productSlug: item.product?.slug || '',
          variantWeight: item.variantWeight,
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.price) * item.quantity,
          imageUrl: item.imageUrl || null,
          // Include full product images so frontend can select correct image
          images: item.product?.images ? item.product.images.map(img => ({
            id: img.id,
            variantId: img.variantId,
            imageType: img.imageType,
            imageUrl: img.imageUrl,
          })) : [],
        })) || [];

      return {
        id: cart.id,
        items,
        subtotal: items.reduce((sum, item) => sum + item.total, 0),
        itemCount: cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
        currency: 'INR',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve cart');
    }
  }

  /**
   * POST /cart/items - Add item to cart
   */
  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  async addItem(@Headers() headers: any, @Body() body: AddToCartDto) {
    try {
      const sessionId = this.getSessionId(headers);
      await this.cartService.addItem(
        sessionId,
        body.productId,
        body.variantId || null,
        body.quantity || 1,
      );
      return this.getCart(headers);
    } catch (error) {
      console.error('Add to cart error:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to add item to cart');
    }
  }

  /**
   * PATCH /cart/items/:itemId - Update item quantity
   */
  @Patch('items/:itemId')
  @HttpCode(HttpStatus.OK)
  async updateItem(
    @Headers() headers: any,
    @Param('itemId') itemId: string,
    @Body() body: UpdateCartItemDto,
  ) {
    try {
      const sessionId = this.getSessionId(headers);
      await this.cartService.updateItemQuantity(sessionId, itemId, body.quantity);
      return this.getCart(headers);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update cart item');
    }
  }

  /**
   * DELETE /cart/items/:itemId - Remove item from cart
   */
  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  async removeItem(@Headers() headers: any, @Param('itemId') itemId: string) {
    try {
      const sessionId = this.getSessionId(headers);
      await this.cartService.removeItem(sessionId, itemId);
      return this.getCart(headers);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to remove cart item');
    }
  }

  /**
   * DELETE /cart - Clear entire cart
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearCart(@Headers() headers: any) {
    try {
      const sessionId = this.getSessionId(headers);
      await this.cartService.clearCart(sessionId);
      return {
        message: 'Cart cleared successfully',
        items: [],
        subtotal: 0,
        itemCount: 0,
        currency: 'INR',
      };
    } catch (error) {
      throw new BadRequestException('Failed to clear cart');
    }
  }

  /**
   * POST /cart/merge - Merge guest cart to user cart (called after login)
   */
  @Post('merge')
  @HttpCode(HttpStatus.OK)
  async mergeCart(@Headers() headers: any) {
    try {
      console.log('[CartController] ===== MERGE CART DEBUG =====');
      console.log('[CartController] All headers received:', JSON.stringify(headers, null, 2));
      console.log('[CartController] x-user-id header value:', headers['x-user-id']);
      console.log('[CartController] x-session-id header value:', headers['x-session-id']);
      
      const sessionId = this.getSessionId(headers);
      const userId = this.getUserId(headers);

      console.log('[CartController] After header extraction - sessionId:', sessionId, 'userId:', userId);

      if (!userId) {
        console.error('[CartController] ERROR: userId is falsy:', userId);
        throw new BadRequestException('User ID is required for cart merge');
      }

      console.log('[CartController] mergeCart called - sessionId:', sessionId, 'userId:', userId);

      await this.cartService.mergeGuestCartToUser(sessionId, userId);

      // Return the merged user cart by userid
      const userCart = await this.cartService.getCartByUserId(userId);
      console.log('[CartController] Returning merged cart for userId:', userId, 'with items:', userCart.items?.length);
      
      return userCart;
    } catch (error) {
      console.error('[CartController] Error in mergeCart:', error?.message || error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error?.message || 'Failed to merge cart');
    }
  }
}
