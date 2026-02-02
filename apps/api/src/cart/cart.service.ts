import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
  ) {}

  async getOrCreateCart(sessionId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { sessionId },
      relations: ['items', 'items.product', 'items.product.images', 'items.variant'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        sessionId,
        // Only expire guest carts; user-bound carts should persist
        expiresAt: sessionId.startsWith('user-')
          ? null
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
      await this.cartRepository.save(cart);
    } else if (sessionId.startsWith('user-') && cart.expiresAt) {
      // Clear any residual expiry if this cart is now user-bound
      cart.expiresAt = null;
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  /**
   * Add item to cart with variantId (UUID)
   * @param sessionId Session identifier for guest carts
   * @param productId Product UUID
   * @param variantId Optional variant UUID
   * @param quantity Number of items to add
   */
  async addItem(
    sessionId: string,
    productId: string,
    variantId?: string | null,
    quantity: number = 1,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(sessionId);
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    let variant: ProductVariant | null = null;
    let variantWeight: string | null = null;

    if (variantId) {
      variant = await this.productVariantRepository.findOne({
        where: { id: variantId },
      });

      if (!variant) {
        throw new NotFoundException(`Variant with ID ${variantId} not found`);
      }

      variantWeight = (variant as any).weight || null;
    }

    // Get price from variant or product
    const itemPrice = variant 
      ? Number(variant.price) 
      : Number(product.price);

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

    // Check if item with same product and variant already exists in cart
    const existingItem = cart.items?.find(
      (item) => item.productId === productId && item.variantId === (variantId || null),
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        variantWeight: variantWeight || null,
        productName: product.name,
        quantity,
        price: itemPrice,
        imageUrl: heroImage,
      } as any);
      await this.cartItemRepository.save(cartItem);
    }

    return this.getOrCreateCart(sessionId);
  }

  /**
   * Update item quantity in cart
   */
  async updateItemQuantity(
    sessionId: string,
    itemId: string,
    quantity: number,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(sessionId);
    const item = cart.items?.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }

    if (quantity <= 0) {
      await this.cartItemRepository.remove(item);
    } else {
      item.quantity = quantity;
      await this.cartItemRepository.save(item);
    }

    return this.getOrCreateCart(sessionId);
  }

  /**
   * Remove item from cart
   */
  async removeItem(sessionId: string, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(sessionId);
    const item = cart.items?.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }

    await this.cartItemRepository.remove(item);
    return this.getOrCreateCart(sessionId);
  }

  /**
   * Clear all items from cart
   */
  async clearCart(sessionId: string): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { sessionId },
      relations: ['items'],
    });

    if (cart) {
      await this.cartItemRepository.remove(cart.items);
    }
  }

  /**
   * Get cart details
   */
  async getCart(sessionId: string): Promise<Cart> {
    return this.getOrCreateCart(sessionId);
  }

  /**
   * Merge guest cart to user cart (when logging in)
   * @param sessionId Guest session ID
   * @param userId User UUID
   */
  async mergeGuestCartToUser(sessionId: string, userId: string): Promise<void> {
    console.log('[CartService] mergeGuestCartToUser called - sessionId:', sessionId, 'userId:', userId);
    
    const guestCart = await this.cartRepository.findOne({
      where: { sessionId },
      relations: ['items', 'items.product', 'items.variant'],
    });

    console.log('[CartService] Found guest cart:', guestCart?.id, 'with items:', guestCart?.items?.length);

    if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
      console.log('[CartService] No guest cart items to merge');
      return; // No guest cart to merge
    }

    const userSessionId = `user-${userId}`;

    // Find or create the user's cart (session-bound to userSessionId) and eagerly load items
    let userCart = await this.cartRepository.findOne({
      where: { sessionId: userSessionId },
      relations: ['items'],
    });

    if (!userCart) {
      userCart = this.cartRepository.create({
        userId,
        sessionId: userSessionId,
        items: [],
      });
      await this.cartRepository.save(userCart);
    } else {
      // Ensure user association is set
      userCart.userId = userId;
      await this.cartRepository.save(userCart);
    }

    // Merge logic: replace quantity for matching product+variant, otherwise add new item
    for (const guestItem of guestCart.items) {
      const existing = userCart.items?.find(
        (item) =>
          item.productId === guestItem.productId &&
          item.variantId === guestItem.variantId,
      );

      if (existing) {
        existing.quantity = guestItem.quantity; // replace with latest guest quantity
        await this.cartItemRepository.save(existing);
      } else {
        const newItem = this.cartItemRepository.create({
          cartId: userCart.id,
          productId: guestItem.productId,
          variantId: guestItem.variantId,
          variantWeight: guestItem.variantWeight,
          productName: guestItem.productName,
          quantity: guestItem.quantity,
          price: guestItem.price,
          imageUrl: guestItem.imageUrl,
        } as any);
        await this.cartItemRepository.save(newItem);
      }
    }

    // Delete the guest cart after migration to avoid orphaned session carts
    await this.cartRepository.remove(guestCart);

    console.log('[CartService] Cart merge complete for userId:', userId, 'with sessionId:', userSessionId);
  }

  /**
   * Get cart by user ID (for authenticated users)
   */
  async getCartByUserId(userId: string): Promise<Cart> {
    let userCart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product', 'items.variant'],
    });

    if (!userCart) {
      // Create a new cart for this user
      userCart = this.cartRepository.create({
        userId,
        items: [],
      });
      await this.cartRepository.save(userCart);
    }

    return userCart;
  }
}
