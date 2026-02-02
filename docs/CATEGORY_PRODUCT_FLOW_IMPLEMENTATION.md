# Category & Product Flow Implementation - Phase 2

## Overview
Implemented a complete e-commerce category and product browsing experience with recommended products feature.

## Features Implemented

### 1. Category Products Page
**Screen**: `CategoryProductsScreen.tsx`
- Displays all products in a selected category
- 2-column grid layout for optimal mobile viewing
- Shows product count in header
- Loading states and empty states
- Navigation back button

**Navigation Flow**:
- HomeScreen Category Grid → CategoryProductsScreen
- CategoryProductsScreen Product Card → ProductDetailScreen

### 2. Category-Based Product Discovery
**Page Update**: `HomeScreen.tsx`
- Category grid now navigates to CategoryProductsScreen instead of just filtering
- Passes `categorySlug` and `categoryName` through navigation params

### 3. Recommended Products Section
**Page Update**: `ProductDetailScreen.tsx`
- Added "You May Also Like" section below product info
- Shows 6 recommended products from same category
- Excludes the current product from recommendations
- Horizontal scrollable carousel of ProductCards
- Clicking recommended products uses `push()` instead of `navigate()` to keep history

### 4. API Endpoints

#### New Query Parameters
- **`category`**: Filter by category slug
- **`exclude`**: Exclude specific product ID from results (for recommendations)

#### Enhanced Products Query
```
GET /api/products?category={slug}&limit={limit}&exclude={productId}
```

Examples:
- Get all organic-millet products: `/api/products?category=organic-millets-siri-daanyaalu`
- Get category products excluding current: `/api/products?category=organic-millets&exclude=abc123&limit=6`

### 5. Mobile API Functions

#### New Functions in `api.ts`
```typescript
// Fetch all products in a category
getProductsByCategory(categorySlug: string): Promise<Product[]>

// Fetch recommended products from same category
getRecommendedProducts(categorySlug: string, excludeProductId?: string, limit?: number): Promise<Product[]>
```

### 6. Backend Enhancements

#### ProductRepository
- Two-step query approach for accurate pagination:
  1. Get product IDs with filters applied
  2. Fetch full products with all relations
- Supports new `excludeProductId` parameter

#### ProductsService
- Added `excludeProductId` parameter support
- Passes through to repository

#### ProductsController
- Added `@Query('exclude')` parameter support
- Passes to service for filtering

## Architecture Decisions

### Two-Step Query Pattern (Repository)
The repository uses a two-step approach to handle JOIN-related pagination issues:
```typescript
// Step 1: Get distinct product IDs with LIMIT applied correctly
const idQuery = ... .select('product.id') ... .limit(limit)

// Step 2: Fetch full products with all relations using those IDs
const fullQuery = ... .where('product.id IN (:...ids)', { ids })
```

**Why**: When using `.leftJoinAndSelect()`, SQL returns multiple rows per product (one per related image/variant). Applying LIMIT at SQL level would cut off products before deduplication. This pattern ensures LIMIT works on distinct products.

### Navigation Stack Strategy
- `navigate()`: Replaces current screen (used for category browsing)
- `push()`: Adds to stack (used for recommended products to maintain browsing history)

## File Changes

### New Files
- `apps/mobile/screens/CategoryProductsScreen.tsx`

### Modified Files
- `apps/mobile/App.tsx` - Added CategoryProducts screen
- `apps/mobile/screens/HomeScreen.tsx` - Updated category navigation
- `apps/mobile/screens/ProductDetailScreen.tsx` - Added recommended products section
- `apps/mobile/lib/api.ts` - Added new API functions
- `apps/api/src/products/products.controller.ts` - Added exclude parameter
- `apps/api/src/products/products.service.ts` - Added exclude parameter
- `apps/api/src/products/product.repository.ts` - Added exclude logic

## User Experience Flow

```
Home Screen
  ↓
[Click Category Card]
  ↓
CategoryProductsScreen (All products in category)
  ↓
[Click Product Card]
  ↓
ProductDetailScreen (Product + Recommended Products)
  ↓
[Click Recommended Product]
  ↓
ProductDetailScreen (New Product)
  ↓
[Back] → Returns to previous ProductDetailScreen
```

## Mobile Styling
- Consistent with existing design system (green theme #2E7D32)
- Grid layout with proper spacing
- Loading indicators for async operations
- Empty states with helpful messaging
- Responsive card sizing for mobile

## Performance Optimizations
- Products cached by Expo Image with `cachePolicy: "disk"`
- Two-step queries avoid N+1 problems
- Proper indexing on database (categoryId, isActive, etc.)
- Pagination support for large category product lists

## Next Steps (Optional Enhancements)
1. Sort/filter options on CategoryProductsScreen (price, rating, etc.)
2. Infinite scroll/pagination for categories with many products
3. Related/similar products algorithm (by tags, attributes)
4. Wishlist integration on product cards
5. Quick view modal instead of full navigation
