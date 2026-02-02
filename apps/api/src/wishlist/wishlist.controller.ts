import {
  Controller,
  Get,
  Post,
  Delete,
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
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';

@ApiTags('Wishlist')
@Controller('wishlist')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

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
   * Extract user ID from headers (set by auth middleware)
   */
  private getUserId(headers: any): string | null {
    const userId = headers['x-user-id'] || null;
    console.log('[WishlistController.getUserId] Accessing header x-user-id:', userId);
    console.log('[WishlistController.getUserId] All header keys:', Object.keys(headers));
    return userId;
  }

  /**
   * GET /wishlist - Retrieve all wishlist items
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getWishlist(@Headers() headers: any) {
    try {
      const userId = this.getUserId(headers);
      const sessionId = this.getSessionId(headers);

      const items = await this.wishlistService.getWishlistWithDetails(userId, sessionId);

      return {
        items,
        itemCount: items.length,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve wishlist');
    }
  }

  /**
   * GET /wishlist/check/:productId - Check if product is in wishlist
   */
  @Get('check/:productId')
  @HttpCode(HttpStatus.OK)
  async checkInWishlist(@Headers() headers: any, @Param('productId') productId: string) {
    try {
      const userId = this.getUserId(headers);
      const sessionId = this.getSessionId(headers);

      const isInWishlist = await this.wishlistService.isInWishlist(
        productId,
        null,
        userId,
        sessionId,
      );

      return {
        productId,
        isInWishlist,
      };
    } catch (error) {
      throw new BadRequestException('Failed to check wishlist');
    }
  }

  /**
   * GET /wishlist/check/:productId/:variantId - Check if product variant is in wishlist
   */
  @Get('check/:productId/:variantId')
  @HttpCode(HttpStatus.OK)
  async checkVariantInWishlist(
    @Headers() headers: any,
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ) {
    try {
      const userId = this.getUserId(headers);
      const sessionId = this.getSessionId(headers);

      const isInWishlist = await this.wishlistService.isInWishlist(
        productId,
        variantId,
        userId,
        sessionId,
      );

      return {
        productId,
        variantId,
        isInWishlist,
      };
    } catch (error) {
      throw new BadRequestException('Failed to check wishlist');
    }
  }

  /**
   * POST /wishlist - Add item to wishlist
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addToWishlist(@Headers() headers: any, @Body() body: AddToWishlistDto) {
    try {
      const userId = this.getUserId(headers);
      const sessionId = this.getSessionId(headers);

      await this.wishlistService.addToWishlist(
        body.productId,
        body.variantId || null,
        userId,
        sessionId,
      );

      const items = await this.wishlistService.getWishlistWithDetails(userId, sessionId);

      return {
        message: 'Item added to wishlist',
        items,
        itemCount: items.length,
      };
    } catch (error) {
      console.error('Add to wishlist error:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to add item to wishlist');
    }
  }

  /**
   * DELETE /wishlist/:productId - Remove item from wishlist
   */
  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  async removeFromWishlist(@Headers() headers: any, @Param('productId') productId: string) {
    try {
      const userId = this.getUserId(headers);
      const sessionId = this.getSessionId(headers);

      await this.wishlistService.removeFromWishlist(productId, null, userId, sessionId);

      const items = await this.wishlistService.getWishlistWithDetails(userId, sessionId);

      return {
        message: 'Item removed from wishlist',
        items,
        itemCount: items.length,
      };
    } catch (error) {
      throw new BadRequestException('Failed to remove item from wishlist');
    }
  }

  /**
   * DELETE /wishlist/:productId/:variantId - Remove variant from wishlist
   */
  @Delete(':productId/:variantId')
  @HttpCode(HttpStatus.OK)
  async removeVariantFromWishlist(
    @Headers() headers: any,
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ) {
    try {
      const userId = this.getUserId(headers);
      const sessionId = this.getSessionId(headers);

      await this.wishlistService.removeFromWishlist(productId, variantId, userId, sessionId);

      const items = await this.wishlistService.getWishlistWithDetails(userId, sessionId);

      return {
        message: 'Item removed from wishlist',
        items,
        itemCount: items.length,
      };
    } catch (error) {
      throw new BadRequestException('Failed to remove item from wishlist');
    }
  }

  /**
   * DELETE /wishlist - Clear entire wishlist
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearWishlist(@Headers() headers: any) {
    try {
      const userId = this.getUserId(headers);
      const sessionId = this.getSessionId(headers);

      await this.wishlistService.clearWishlist(userId, sessionId);

      return {
        message: 'Wishlist cleared',
        items: [],
        itemCount: 0,
      };
    } catch (error) {
      throw new BadRequestException('Failed to clear wishlist');
    }
  }

  /**
   * POST /wishlist/merge - Merge guest wishlist to user wishlist (called after login)
   */
  @Post('merge')
  @HttpCode(HttpStatus.OK)
  async mergeWishlist(@Headers() headers: any) {
    try {
      console.log('[WishlistController] ===== MERGE WISHLIST DEBUG =====');
      console.log('[WishlistController] All headers received:', JSON.stringify(headers, null, 2));
      console.log('[WishlistController] x-user-id header value:', headers['x-user-id']);
      console.log('[WishlistController] x-session-id header value:', headers['x-session-id']);
      
      const sessionId = this.getSessionId(headers);
      const userId = this.getUserId(headers);

      console.log('[WishlistController] After header extraction - sessionId:', sessionId, 'userId:', userId);

      if (!userId) {
        console.error('[WishlistController] ERROR: userId is falsy:', userId);
        throw new BadRequestException('User ID is required for wishlist merge');
      }

      console.log('[WishlistController] mergeWishlist called - sessionId:', sessionId, 'userId:', userId);

      await this.wishlistService.mergeGuestWishlistToUser(sessionId, userId);

      const items = await this.wishlistService.getWishlistWithDetails(userId, null);

      console.log('[WishlistController] Returning merged wishlist for userId:', userId, 'with items:', items?.length);

      return {
        message: 'Wishlist merged successfully',
        items,
        itemCount: items.length,
      };
    } catch (error) {
      console.error('[WishlistController] Error in mergeWishlist:', error?.message || error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error?.message || 'Failed to merge wishlist');
    }
  }
}
