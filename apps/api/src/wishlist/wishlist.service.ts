import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../entities/wishlist.entity';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product.entity';

interface WishlistQueryParams {
  userId?: string | null;
  sessionId?: string | null;
}

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
  ) {}

  /**
   * Add item to wishlist (guest or user)
   * @param productId Product UUID
   * @param variantId Optional variant UUID
   * @param userId User UUID (for logged-in users)
   * @param sessionId Session ID (for guests)
   */
  async addToWishlist(
    productId: string,
    variantId: string | null,
    userId?: string | null,
    sessionId?: string | null,
  ): Promise<Wishlist> {
    // Validate inputs
    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId must be provided');
    }

    // Verify product exists and fetch with images
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['images'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Verify variant exists if provided
    let variant: any = null;
    if (variantId) {
      variant = await this.productVariantRepository.findOne({
        where: { id: variantId },
      });

      if (!variant) {
        throw new NotFoundException(`Variant with ID ${variantId} not found`);
      }
    }

    // Build where clause to check if already in wishlist
    const whereClause: any = {
      productId,
      ...(userId ? { userId } : {}),
      ...(sessionId ? { sessionId } : {}),
    };

    if (variantId) {
      whereClause.variantId = variantId;
    } else {
      whereClause.variantId = null as any;
    }

    // Check if already in wishlist
    const existingWishlist = await this.wishlistRepository.findOne({
      where: whereClause,
    });

    if (existingWishlist) {
      // Already in wishlist, return existing
      return existingWishlist;
    }

    // Get hero image - prefer variant-specific hero-card, then product hero-card, then any variant image, then any product image
    let heroImage: string | null = null;
    
    if (product.images && product.images.length > 0) {
      // 1. Look for variant-specific hero-card image
      if (variantId) {
        const variantHeroCard = product.images.find(
          (img) => img.variantId === variantId && img.imageType === 'hero-card'
        );
        if (variantHeroCard) {
          heroImage = variantHeroCard.imageUrl;
        }
      }
      
      // 2. Fall back to product-level hero-card image
      if (!heroImage) {
        const productHeroCard = product.images.find(
          (img) => !img.variantId && img.imageType === 'hero-card'
        );
        if (productHeroCard) {
          heroImage = productHeroCard.imageUrl;
        }
      }
      
      // 3. Fall back to any variant-specific image
      if (!heroImage && variantId) {
        const variantImage = product.images.find((img) => img.variantId === variantId);
        if (variantImage) {
          heroImage = variantImage.imageUrl;
        }
      }
      
      // 4. Fall back to first product image
      if (!heroImage) {
        heroImage = product.images[0].imageUrl;
      }
    }

    // Add to wishlist
    const wishlistItem = this.wishlistRepository.create({
      productId,
      variantId: variantId || null,
      userId: userId || null,
      sessionId: sessionId || null,
      imageUrl: heroImage,
      expiresAt: sessionId ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null, // 7 days for guests
    } as any);

    const result = await this.wishlistRepository.save(wishlistItem);
    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(
    productId: string,
    variantId: string | null,
    userId?: string | null,
    sessionId?: string | null,
  ): Promise<void> {
    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId must be provided');
    }

    const whereClause: any = {
      productId,
      ...(userId ? { userId } : {}),
      ...(sessionId ? { sessionId } : {}),
    };

    if (variantId) {
      whereClause.variantId = variantId;
    } else {
      whereClause.variantId = null as any;
    }

    await this.wishlistRepository.delete(whereClause);
  }

  /**
   * Check if item is in wishlist
   */
  async isInWishlist(
    productId: string,
    variantId: string | null,
    userId?: string | null,
    sessionId?: string | null,
  ): Promise<boolean> {
    if (!userId && !sessionId) {
      return false;
    }

    const whereClause: any = {
      productId,
      ...(userId ? { userId } : {}),
      ...(sessionId ? { sessionId } : {}),
    };

    if (variantId) {
      whereClause.variantId = variantId;
    } else {
      whereClause.variantId = null as any;
    }

    const wishlist = await this.wishlistRepository.findOne({
      where: whereClause,
    });

    return !!wishlist;
  }

  /**
   * Get all wishlist items for user or guest
   */
  async getWishlist(
    userId?: string | null,
    sessionId?: string | null,
  ): Promise<Wishlist[]> {
    if (!userId && !sessionId) {
      return [];
    }

    const whereClause: any = userId ? { userId } : { sessionId };

    const wishlists = await this.wishlistRepository.find({
      where: whereClause,
      relations: ['product', 'product.images', 'variant'],
      order: { createdAt: 'DESC' },
    });

    return wishlists;
  }

  /**
   * Get wishlist with formatted product details
   */
  async getWishlistWithDetails(
    userId?: string | null,
    sessionId?: string | null,
  ): Promise<
    Array<{
      id: string;
      productId: string;
      productName: string;
      productSlug: string;
      variantId: string | null;
      variantWeight: string | null;
      price: number;
      imageUrl: string | null;
      images: any[];
      addedAt: Date;
    }>
  > {
    const wishlists = await this.getWishlist(userId, sessionId);

    return wishlists.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name || '',
      productSlug: item.product?.slug || '',
      variantId: item.variantId || null,
      variantWeight: item.variant ? (item.variant as any).weight : null,
      // Use variant price if available, otherwise use product price
      price: item.variant 
        ? Number(item.variant.price) 
        : Number(item.product?.price || 0),
      imageUrl: item.imageUrl || null,
      // Include full product images so frontend can select correct image
      images: item.product?.images || [],
      addedAt: item.createdAt,
    }));
  }

  /**
   * Clear wishlist (remove all items)
   */
  async clearWishlist(
    userId?: string | null,
    sessionId?: string | null,
  ): Promise<void> {
    if (!userId && !sessionId) {
      return;
    }

    const whereClause: any = userId ? { userId } : { sessionId };

    await this.wishlistRepository.delete(whereClause);
  }

  /**
   * Merge guest wishlist to user account (when logging in)
   */
  async mergeGuestWishlistToUser(
    sessionId: string,
    userId: string,
  ): Promise<void> {
    console.log('[WishlistService] mergeGuestWishlistToUser called - sessionId:', sessionId, 'userId:', userId);
    
    const guestWishlists = await this.wishlistRepository.find({
      where: { sessionId } as any,
    });

    console.log('[WishlistService] Found guest wishlist items:', guestWishlists?.length);

    for (const guestItem of guestWishlists) {
      // Check if user already has this item
      const whereClause: any = {
        userId,
        productId: guestItem.productId,
      };

      if (guestItem.variantId) {
        whereClause.variantId = guestItem.variantId;
      } else {
        whereClause.variantId = null as any;
      }

      const existingUserWishlist = await this.wishlistRepository.findOne({
        where: whereClause,
      });

      if (!existingUserWishlist) {
        // Migrate guest item to user
        guestItem.userId = userId;
        guestItem.sessionId = null as any;
        guestItem.expiresAt = null;
        await this.wishlistRepository.save(guestItem);
        console.log('[WishlistService] Migrated wishlist item:', guestItem.id, 'to userId:', userId);
      } else {
        // User already has it, just delete guest copy
        await this.wishlistRepository.remove(guestItem);
        console.log('[WishlistService] User already has item, removed guest copy');
      }
    }
    
    console.log('[WishlistService] Wishlist migration complete');
  }
}
