# Admin Services Package

Validation schemas and utility functions for the Country Natural Foods admin portal.

## Validation Schemas (Zod)

### Auth
```typescript
adminLoginSchema
createAdminUserSchema
```

### Products
```typescript
createProductSchema
updateProductSchema
```

### Variants
```typescript
createVariantSchema
updateVariantSchema
```

### Categories
```typescript
createCategorySchema
updateCategorySchema
```

### Images
```typescript
uploadImageSchema
```

## Utility Functions

### Price Calculations
```typescript
calculateDiscount(originalPrice, discountPrice) // Returns percentage
calculateDiscountPrice(originalPrice, discountPercent) // Returns price
```

### Text Processing
```typescript
slugify(text) // Converts text to URL-friendly slug
```

### Validation
```typescript
validateImageFile(file) // Validates file type and size
```

## Usage

### Form Validation with React Hook Form

```typescript
import { createProductSchema } from '@countrynatural/admin-services';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function ProductForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createProductSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}
```

### Price Calculations

```typescript
import { calculateDiscount, calculateDiscountPrice } from '@countrynatural/admin-services';

const originalPrice = 1000;
const discountPrice = 750;
const discountPercent = calculateDiscount(originalPrice, discountPrice); // 25%

const newPrice = calculateDiscountPrice(1000, 20); // 800
```

### Slug Generation

```typescript
import { slugify } from '@countrynatural/admin-services';

const slug = slugify('Product Name With Spaces'); // 'product-name-with-spaces'
```

### Image Validation

```typescript
import { validateImageFile } from '@countrynatural/admin-services';

const file = new File([...], 'image.jpg', { type: 'image/jpeg' });
const { valid, error } = validateImageFile(file);

if (!valid) {
  console.error(error); // 'Image size must be less than 5MB'
}
```

## Re-exports

This package re-exports all types from `@countrynatural/admin-types`:

```typescript
import { Product, AdminUser } from '@countrynatural/admin-services';
```
