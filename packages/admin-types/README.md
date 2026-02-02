# Admin Types Package

Shared TypeScript types and interfaces for the Country Natural Foods admin portal.

## Types

### Admin & Auth
- `AdminUser` - Admin user information
- `LoginResponse` - Login endpoint response
- `AuthError` - Auth error details

### Products
- `Product` - Full product entity
- `ProductVariant` - Product variant
- `ProductImage` - Product image
- `CreateProductDto` - Create product request
- `UpdateProductDto` - Update product request
- `CreateVariantDto` - Create variant request
- `UpdateVariantDto` - Update variant request

### Categories
- `Category` - Product category
- `CreateCategoryDto` - Create category request
- `UpdateCategoryDto` - Update category request

### API
- `ApiResponse<T>` - Generic API response
- `ApiListResponse<T>` - Paginated API response
- `PaginationParams` - Pagination parameters
- `ProductFilters` - Product filtering options

### Analytics
- `DashboardStats` - Dashboard statistics
- `OrderData` - Order information
- `ProductStats` - Product statistics

## Usage

```typescript
import { Product, AdminUser, CreateProductDto } from '@countrynatural/admin-types';

const product: Product = { ... };
const admin: AdminUser = { ... };
```
