# Admin API Client Package

HTTP client for the Country Natural Foods admin API.

## Features

- 🔐 Automatic token injection
- 🔄 Token refresh on expiry
- 📦 Typed API clients for all endpoints
- ⚡ Built with Axios
- 🛡️ Error handling and interceptors

## Clients

### AuthClient
```typescript
apiClient.auth.login(email, password)
apiClient.auth.logout()
apiClient.auth.me()
apiClient.auth.refreshToken()
apiClient.auth.resetPassword(email)
```

### ProductClient
```typescript
apiClient.products.getAll(filters)
apiClient.products.getById(id)
apiClient.products.create(data)
apiClient.products.update(id, data)
apiClient.products.delete(id)
apiClient.products.bulkDelete(ids)
```

### VariantClient
```typescript
apiClient.variants.getByProductId(productId)
apiClient.variants.create(productId, data)
apiClient.variants.update(productId, variantId, data)
apiClient.variants.delete(productId, variantId)
apiClient.variants.reorder(productId, variantIds)
```

### ImageClient
```typescript
apiClient.images.uploadImage(productId, file, metadata)
apiClient.images.uploadMultiple(productId, files)
apiClient.images.updateImage(productId, imageId, data)
apiClient.images.setDefault(productId, imageId)
apiClient.images.deleteImage(productId, imageId)
apiClient.images.reorderImages(productId, imageIds)
```

### CategoryClient
```typescript
apiClient.categories.getAll()
apiClient.categories.getById(id)
apiClient.categories.create(data)
apiClient.categories.update(id, data)
apiClient.categories.delete(id)
apiClient.categories.reorder(categoryIds)
```

## Usage

```typescript
import { AdminApiClient } from '@countrynatural/admin-api-client';

const apiClient = new AdminApiClient('http://localhost:3001/api');

// Login
const response = await apiClient.auth.login('admin@example.com', 'password');
apiClient.setToken(response.data.token);

// Get products
const products = await apiClient.products.getAll({ page: 1, pageSize: 20 });

// Create product
const product = await apiClient.products.create({
  name: 'Product Name',
  slug: 'product-slug',
  // ... other fields
});
```

## Token Management

The client automatically handles:
- Token injection in all requests
- Token refresh on 401 responses
- Token storage in localStorage
- Automatic redirect to login on auth failure

## Error Handling

All API calls throw `AxiosError` on failure. Handle with try-catch:

```typescript
try {
  const product = await apiClient.products.getById(id);
} catch (error) {
  const message = error?.response?.data?.message || 'Unknown error';
  console.error(message);
}
```
