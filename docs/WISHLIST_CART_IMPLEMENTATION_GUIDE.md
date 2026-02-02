# Wishlist & Cart Schema Update - Implementation Guide

## ✅ What Was Done

### 1. **Documentation Created**
- [WISHLIST_CART_SCHEMA_RECOMMENDATIONS.md](WISHLIST_CART_SCHEMA_RECOMMENDATIONS.md) - Full analysis and recommendations

### 2. **Migration Created**
- `1736630000000-UpdateWishlistAndCartVariants.ts` - Database schema updates

### 3. **Entities Updated**
- `wishlist.entity.ts` - Added variantId with proper relationships
- `cart-item.entity.ts` - Modernized to use UUID variantId instead of varchar

---

## 🚀 Next Steps

### Step 1: Run the Migration

```powershell
cd C:\xampp\htdocs\CountryNaturalFoods\apps\api
pnpm typeorm migration:run
```

**Expected Output:**
```
Migration UpdateWishlistAndCartVariants1736630000000 has been executed successfully.
```

### Step 2: Verify in Database

Open Adminer: http://localhost:8080

**Check Wishlists Table:**
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'wishlists';
```

Should show:
- `variantId` (uuid, nullable)
- Foreign key to `product_variants`

**Check Cart_Items Table:**
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cart_items';
```

Should show:
- `variantId` (uuid, nullable)
- `variantWeight` (varchar)
- `productName` (varchar)
- `price` (numeric)
- Old `variant` column should be REMOVED

### Step 3: Update API Services

#### **Wishlist Service** (Create if doesn't exist)

```typescript
// apps/api/src/wishlist/wishlist.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../entities/wishlist.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepo: Repository<Wishlist>,
  ) {}

  async addToWishlist(userId: string, productId: string, variantId?: string) {
    const existing = await this.wishlistRepo.findOne({
      where: { userId, productId, variantId: variantId || null },
    });

    if (existing) {
      throw new Error('Item already in wishlist');
    }

    const wishlistItem = this.wishlistRepo.create({
      userId,
      productId,
      variantId: variantId || null,
    });

    return this.wishlistRepo.save(wishlistItem);
  }

  async getWishlist(userId: string) {
    return this.wishlistRepo.find({
      where: { userId },
      relations: ['product', 'variant'],
    });
  }

  async removeFromWishlist(userId: string, productId: string, variantId?: string) {
    return this.wishlistRepo.delete({
      userId,
      productId,
      variantId: variantId || null,
    });
  }
}
```

#### **Cart Service** (Update existing)

```typescript
// Update addToCart method in apps/api/src/cart/cart.service.ts

async addItem(
  cart: Cart,
  productId: string,
  variantId: string | null,
  quantity: number,
): Promise<Cart> {
  // Find variant to get price and weight
  const variant = variantId 
    ? await this.variantRepo.findOne({ where: { id: variantId } })
    : null;
  
  const product = await this.productRepo.findOne({ 
    where: { id: productId } 
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Check if item already exists
  const existingItem = cart.items?.find(
    (item) => item.productId === productId && item.variantId === variantId,
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    await this.cartItemRepo.save(existingItem);
  } else {
    const newItem = this.cartItemRepo.create({
      cartId: cart.id,
      productId,
      productName: product.name,
      variantId: variantId || null,
      variantWeight: variant?.weight || null,
      quantity,
      price: variant?.price || product.price,
    });
    await this.cartItemRepo.save(newItem);
  }

  return this.getCart(cart.sessionId);
}
```

### Step 4: Update API Endpoints

#### **Wishlist Controller** (Create if doesn't exist)

```typescript
// apps/api/src/wishlist/wishlist.controller.ts
import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  async addToWishlist(
    @Body() body: { userId: string; productId: string; variantId?: string },
  ) {
    return this.wishlistService.addToWishlist(
      body.userId,
      body.productId,
      body.variantId,
    );
  }

  @Get(':userId')
  async getWishlist(@Param('userId') userId: string) {
    return this.wishlistService.getWishlist(userId);
  }

  @Delete()
  async removeFromWishlist(
    @Body() body: { userId: string; productId: string; variantId?: string },
  ) {
    return this.wishlistService.removeFromWishlist(
      body.userId,
      body.productId,
      body.variantId,
    );
  }
}
```

#### **Cart Controller** (Update existing)

```typescript
// Update POST /cart/items endpoint
@Post('items')
async addItem(
  @Headers('x-session-id') sessionId: string,
  @Body() body: { 
    productId: string; 
    variantId?: string;  // ← Changed from 'variant' string
    quantity?: number;
  },
) {
  const cart = await this.cartService.getOrCreateCart(sessionId);
  return this.cartService.addItem(
    cart,
    body.productId,
    body.variantId || null,
    body.quantity || 1,
  );
}
```

### Step 5: Update Mobile App

#### **WishlistContext.tsx** (Create or update)

```typescript
// apps/mobile/src/context/WishlistContext.tsx
import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WishlistItem {
  productId: string;
  variantId?: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (productId: string, variantId?: string) => Promise<void>;
  removeFromWishlist: (productId: string, variantId?: string) => Promise<void>;
  isInWishlist: (productId: string, variantId?: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const addToWishlist = async (productId: string, variantId?: string) => {
    const newItem = { productId, variantId };
    const updated = [...wishlist, newItem];
    setWishlist(updated);
    await AsyncStorage.setItem('wishlist', JSON.stringify(updated));
    
    // TODO: Sync with API
    // await fetch(`${API_BASE}/wishlist`, {
    //   method: 'POST',
    //   body: JSON.stringify({ userId, productId, variantId }),
    // });
  };

  const removeFromWishlist = async (productId: string, variantId?: string) => {
    const updated = wishlist.filter(
      item => !(item.productId === productId && item.variantId === variantId)
    );
    setWishlist(updated);
    await AsyncStorage.setItem('wishlist', JSON.stringify(updated));
  };

  const isInWishlist = (productId: string, variantId?: string) => {
    return wishlist.some(
      item => item.productId === productId && item.variantId === variantId
    );
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
```

#### **ProductCard.tsx** (Update)

```typescript
// apps/mobile/src/components/ProductCard.tsx
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product, selectedVariant }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [currentVariant, setCurrentVariant] = useState(selectedVariant);
  
  const handleWishlistToggle = async () => {
    if (isInWishlist(product.id, currentVariant?.id)) {
      await removeFromWishlist(product.id, currentVariant?.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Show variant picker if multiple variants
      if (product.variants?.length > 1) {
        showVariantPicker(() => {
          addToWishlist(product.id, currentVariant?.id);
        });
      } else {
        await addToWishlist(product.id, currentVariant?.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  const isWishlisted = isInWishlist(product.id, currentVariant?.id);

  return (
    <TouchableOpacity onPress={handleWishlistToggle}>
      <Icon 
        name={isWishlisted ? "heart" : "heart-outline"} 
        color={isWishlisted ? "#DC2626" : "#666"}
      />
    </TouchableOpacity>
  );
};
```

---

## 🧪 Testing Checklist

### Database Tests
- [ ] Migration runs without errors
- [ ] Wishlists table has variantId column
- [ ] Cart_items table has variantId, variantWeight, productName columns
- [ ] Old variant VARCHAR column is removed from cart_items
- [ ] Foreign keys created properly
- [ ] Indexes created properly

### API Tests
- [ ] POST /wishlist - Add item with variantId
- [ ] GET /wishlist/:userId - Returns items with variant details
- [ ] DELETE /wishlist - Removes specific variant
- [ ] POST /cart/items - Add item with variantId
- [ ] GET /cart/:sessionId - Returns cart with variant details

### Mobile App Tests
- [ ] Heart icon shows variant picker for multi-variant products
- [ ] Wishlist saves product + variant together
- [ ] Wishlist screen displays variant info (500ml, 1L, etc.)
- [ ] "Add to Cart" from wishlist uses saved variant
- [ ] Cart displays correct variant information

---

## 📋 Migration Rollback (If Needed)

If something goes wrong:

```powershell
cd C:\xampp\htdocs\CountryNaturalFoods\apps\api
pnpm typeorm migration:revert
```

This will:
- Restore old `variant` VARCHAR column in cart_items
- Remove `variantId` from both tables
- Restore old unique constraints

---

## 🎯 Benefits Summary

### Before
- ❌ Wishlist only saved product, not variant
- ❌ Had to re-select variant when adding to cart
- ❌ Cart used string-based variant field
- ❌ No referential integrity

### After
- ✅ Wishlist saves exact variant user wants
- ✅ One-click add to cart with pre-selected variant
- ✅ Cart uses proper UUID references
- ✅ Full referential integrity with foreign keys
- ✅ Better analytics (track which variants are popular)
- ✅ Consistent with add_to_cart_events table

---

## 📞 Support

If you encounter issues:

1. Check migration logs for errors
2. Verify entity imports are correct
3. Restart API server after migration
4. Clear mobile app cache/storage
5. Check Adminer for schema verification

---

## 🎉 Success Criteria

You'll know it's working when:
1. Users can add specific variants to wishlist
2. Wishlist shows "500ml - ₹299" instead of just product name
3. "Add to Cart" from wishlist pre-selects the variant
4. Cart tracks which variant is in cart
5. No duplicate entries for same product + variant combo
