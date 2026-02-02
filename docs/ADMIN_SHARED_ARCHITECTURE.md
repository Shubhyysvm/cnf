# Admin Portal - Shared Code Architecture

## Visual Overview

```
┌────────────────────────────────────────────────────────────────┐
│                    MONOREPO STRUCTURE                          │
└────────────────────────────────────────────────────────────────┘

/CountryNaturalFoods
├── /apps
│   ├── /api                          ← SHARED BACKEND (NestJS)
│   │   ├── src/auth/admin-auth.controller.ts
│   │   ├── src/products/admin-products.controller.ts
│   │   ├── src/categories/admin-categories.controller.ts
│   │   ├── src/inventory/admin-inventory.controller.ts
│   │   └── src/analytics/admin-analytics.controller.ts
│   │
│   ├── /web                          ← CUSTOMER WEB (Next.js) - Unchanged
│   ├── /mobile                       ← CUSTOMER APP (React Native) - Unchanged
│   │
│   ├── /admin-web                    ← NEW: ADMIN WEB (Next.js) - PRIORITY
│   │   ├── src/app/
│   │   │   ├── (auth)/login/page.tsx
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx                    (Dashboard)
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx                (Product List)
│   │   │   │   │   ├── create/page.tsx         (Create Product)
│   │   │   │   │   └── [id]/edit/page.tsx      (Edit Product)
│   │   │   │   ├── categories/page.tsx
│   │   │   │   ├── inventory/page.tsx
│   │   │   │   ├── analytics/page.tsx
│   │   │   │   ├── settings/page.tsx
│   │   │   │   └── users/page.tsx
│   │   ├── src/components/
│   │   │   ├── ProductForm.tsx        (Reusable with tabs)
│   │   │   ├── ImageUpload.tsx        (Drag-drop zone)
│   │   │   ├── VariantTable.tsx
│   │   │   └── ...
│   │   ├── src/hooks/
│   │   │   ├── useAdminAuth.ts        (Auth hook)
│   │   │   ├── useProducts.ts         (API calls)
│   │   │   └── ...
│   │   └── package.json (depends on @countrynatural/admin-api-client, etc.)
│   │
│   └── /admin-mobile                 ← NEW: ADMIN MOBILE (React Native) - LATER
│       ├── src/screens/
│       │   ├── LoginScreen.tsx
│       │   ├── DashboardScreen.tsx
│       │   ├── ProductListScreen.tsx
│       │   ├── ProductEditScreen.tsx
│       │   └── ...
│       ├── src/services/              (Reuses shared packages)
│       └── package.json (depends on @countrynatural/admin-api-client, etc.)
│
├── /packages
│   ├── /ui                           ← EXISTING: Web + Mobile shared components
│   ├── /types                        ← EXISTING: Customer app types
│   │
│   ├── /admin-types                  ← NEW: Admin types (SHARED)
│   │   └── src/
│   │       ├── product.types.ts       (Product, ProductVariant, ProductImage)
│   │       ├── category.types.ts
│   │       ├── order.types.ts
│   │       ├── admin-user.types.ts    (Admin account, roles, permissions)
│   │       ├── dtos/                  (Request/response shapes)
│   │       │   ├── create-product.dto.ts
│   │       │   ├── update-variant.dto.ts
│   │       │   ├── upload-image.dto.ts
│   │       │   └── ...
│   │       └── index.ts               (Export all types)
│   │
│   ├── /admin-api-client             ← NEW: Admin HTTP client (SHARED)
│   │   └── src/
│   │       ├── AdminHttpClient.ts     (Axios instance with token refresh)
│   │       ├── clients/
│   │       │   ├── ProductClient.ts   (GET /admin/products, POST /admin/products, etc.)
│   │       │   ├── CategoryClient.ts
│   │       │   ├── ImageClient.ts     (POST /admin/products/:id/images, etc.)
│   │       │   ├── VariantClient.ts   (POST /admin/products/:id/variants, etc.)
│   │       │   ├── InventoryClient.ts
│   │       │   ├── AnalyticsClient.ts
│   │       │   ├── SettingsClient.ts
│   │       │   ├── UserClient.ts
│   │       │   └── AuthClient.ts      (POST /admin/auth/login, etc.)
│   │       ├── types.ts               (Re-exports @countrynatural/admin-types)
│   │       └── index.ts               (Export all clients + types)
│   │
│   ├── /admin-services               ← NEW: Admin business logic (SHARED)
│   │   └── src/
│   │       ├── validation/
│   │       │   ├── product.schema.ts  (Zod schemas for product form)
│   │       │   ├── variant.schema.ts
│   │       │   └── ...
│   │       ├── utils/
│   │       │   ├── price.utils.ts     (Calculate discount % from price/discountPrice)
│   │       │   ├── image.utils.ts     (Image ordering, validation)
│   │       │   ├── stock.utils.ts     (Determine stock status)
│   │       │   └── ...
│   │       └── index.ts               (Export utilities)
│   │
│   ├── /ui-web                       ← NEW: Web UI components (web-only)
│   │   └── src/
│   │       ├── Tabs.tsx               (Shadcn/ui Tabs for product form)
│   │       ├── DataTable.tsx          (TanStack React Table)
│   │       ├── ImageGrid.tsx          (4-column grid for images)
│   │       ├── DragDropZone.tsx       (Dropzone for images)
│   │       └── ...
│   │
│   └── /ui-mobile                    ← NEW: Mobile UI components (mobile-only)
│       └── src/
│           ├── Button.tsx             (React Native Pressable)
│           ├── TextInput.tsx          (React Native TextInput)
│           ├── ScrollView.tsx         (Vertical scroll container)
│           └── ...
│
└── /docker-compose.yml, /pnpm-workspace.yaml, etc.
```

---

## Code Sharing Strategy

### TIER 1: Fully Shared (100% identical code)

**Location**: `/packages/admin-types`, `/packages/admin-api-client`, `/packages/admin-services`

**Used in**:
- `/apps/admin-web` (Next.js)
- `/apps/admin-mobile` (React Native)
- Identical imports, identical logic

**Example - Admin Types** (`/packages/admin-types`):
```typescript
// product.types.ts
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  badges: string[];
  category: Category;
  variants: ProductVariant[];
  images: ProductImage[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isLatestArrival: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  price: number;
  discountPrice?: number;
  discount?: number;
  offer?: string;
  sku?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  shelfLife?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText?: string;
  fileName?: string;
  displayOrder: number;
  isDefault: boolean;
  createdAt: Date;
}

// Used identically in web and mobile:
import { Product, ProductVariant, ProductImage } from '@countrynatural/admin-types';
```

**Example - Admin API Client** (`/packages/admin-api-client`):
```typescript
// ProductClient.ts
export class AdminProductClient {
  constructor(private http: AdminHttpClient) {}

  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    return this.http.get('/admin/products', { params: filters });
  }

  async getProduct(id: string): Promise<Product> {
    return this.http.get(`/admin/products/${id}`);
  }

  async createProduct(data: CreateProductDTO): Promise<Product> {
    return this.http.post('/admin/products', data);
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    return this.http.patch(`/admin/products/${id}`, data);
  }

  async deleteProduct(id: string): Promise<void> {
    return this.http.delete(`/admin/products/${id}`);
  }

  async uploadImages(productId: string, files: File[]): Promise<ProductImage[]> {
    const formData = new FormData();
    files.forEach((f, i) => formData.append(`files`, f));
    return this.http.post(`/admin/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async updateImage(productId: string, imageId: string, data: UpdateImageDTO): Promise<ProductImage> {
    return this.http.patch(`/admin/products/${productId}/images/${imageId}`, data);
  }

  async setDefaultImage(productId: string, imageId: string): Promise<void> {
    return this.http.patch(`/admin/products/${productId}/images/${imageId}/set-default`);
  }

  async deleteImage(productId: string, imageId: string): Promise<void> {
    return this.http.delete(`/admin/products/${productId}/images/${imageId}`);
  }

  // ... variant methods, category methods, etc.
}

// Used identically in web and mobile:
import { AdminProductClient } from '@countrynatural/admin-api-client';
const productClient = new AdminProductClient(httpClient);
const products = await productClient.getProducts();
```

**Example - Admin Services** (`/packages/admin-services`):
```typescript
// validation/product.schema.ts
import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  categoryId: z.string().uuid(),
  shortDescription: z.string().max(100),
  description: z.string().min(10),
  price: z.number().positive(),
  badges: z.array(z.string()).optional(),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isLatestArrival: z.boolean().default(false),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

// utils/price.utils.ts
export function calculateDiscount(price: number, discountPrice: number): number {
  if (!discountPrice || discountPrice <= price) return 0;
  return Math.round(((discountPrice - price) / discountPrice) * 100);
}

// Used identically in web and mobile:
import { CreateProductSchema } from '@countrynatural/admin-services';
const validationResult = CreateProductSchema.parse(formData);
```

---

### TIER 2: Platform-Specific UI (different per platform)

**Location**: `/packages/ui-web`, `/packages/ui-mobile`

**Web** (`/packages/ui-web`):
```typescript
// Tabs.tsx - Shadcn/ui based
export function Tabs({ tabs }: { tabs: TabItem[] }) {
  return (
    <TabsComponent>
      {tabs.map(tab => (
        <TabsContent key={tab.id} value={tab.id}>
          {tab.content}
        </TabsContent>
      ))}
    </TabsComponent>
  );
}
```

**Mobile** (`/packages/ui-mobile`):
```typescript
// Tabs.tsx - React Native Pressable + ScrollView
export function Tabs({ tabs }: { tabs: TabItem[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  return (
    <View>
      <ScrollView horizontal>
        {tabs.map(tab => (
          <Pressable
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text>{tab.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {tabs.find(t => t.id === activeTab)?.content}
    </View>
  );
}
```

---

### TIER 3: Feature Implementation (mostly different)

**Web** (`/apps/admin-web`):
```typescript
// src/components/ProductForm.tsx - Next.js form with Tailwind + Shadcn/ui
import { useAdminProductClient } from '@hooks/useAdminAuth';
import { CreateProductSchema } from '@countrynatural/admin-services';
import { Tabs } from '@countrynatural/ui-web';

export function ProductForm({ productId }: { productId?: string }) {
  const form = useForm({ resolver: zodResolver(CreateProductSchema) });
  const client = useAdminProductClient();

  const onSubmit = async (data: CreateProductInput) => {
    if (productId) {
      await client.updateProduct(productId, data);
    } else {
      await client.createProduct(data);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Tabs tabs={[
        { id: 'basic', label: 'Basic Info', content: <BasicInfoTab /> },
        { id: 'variants', label: 'Variants', content: <VariantsTab /> },
        { id: 'images', label: 'Images', content: <ImagesTab /> },
      ]} />
      <button type="submit">Save</button>
    </form>
  );
}
```

**Mobile** (`/apps/admin-mobile`):
```typescript
// src/screens/ProductEditScreen.tsx - React Native form
import { useAdminProductClient } from '@hooks/useAdminAuth';
import { CreateProductSchema } from '@countrynatural/admin-services';
import { Tabs } from '@countrynatural/ui-mobile';

export function ProductEditScreen() {
  const { productId } = useRoute().params;
  const [activeTab, setActiveTab] = useState('basic');
  const client = useAdminProductClient();

  const onSave = async (data: CreateProductInput) => {
    if (productId) {
      await client.updateProduct(productId, data);
    } else {
      await client.createProduct(data);
    }
  };

  return (
    <View style={styles.container}>
      <Tabs 
        tabs={[
          { id: 'basic', label: 'Info', content: <BasicInfoTab /> },
          { id: 'variants', label: 'Variants', content: <VariantsTab /> },
          { id: 'images', label: 'Images', content: <ImagesTab /> },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <Button onPress={onSave} title="Save" />
    </View>
  );
}
```

**Notice**: Same API calls, same validation, DIFFERENT UI!

---

## Benefits Summary

| Aspect | Shared | Platform-Specific |
|--------|--------|------------------|
| **API Client** | ✅ 100% identical | - |
| **Types** | ✅ 100% identical | - |
| **Validation** | ✅ 100% identical | - |
| **Business Logic** | ✅ 100% identical | - |
| **HTTP Requests** | ✅ Same URLs, methods | - |
| **UI Components** | ❌ Different libraries | Platform-native |
| **Navigation** | ❌ Different paradigms | Next.js vs RN Navigation |
| **Styling** | ❌ Different systems | Tailwind vs StyleSheet |
| **Forms** | Validation shared | Implementation per-platform |
| **Code Reuse** | **~60% across tiers** | **~40% platform-specific** |

---

## Implementation Order

1. **Week 1**: Build shared packages + web admin auth
   - `/packages/admin-types`
   - `/packages/admin-api-client`
   - `/packages/admin-services`
   - `/apps/admin-web/login`

2. **Week 2-3**: Build web admin features
   - Product list, create, edit
   - Image upload
   - Variant management
   - All in `/apps/admin-web`

3. **Week 4**: Polish, test, deploy

4. **Later** (if needed): Build mobile using shared packages
   - Reuse all of `/packages/admin-*`
   - Build mobile-specific screens in `/apps/admin-mobile`

---

## Answer to Your Question

**"Can we have same frontend and backend code for admin?"**

✅ **PARTIALLY YES:**
- **100% Shared**: Backend API (NestJS), API client code, TypeScript types, business logic
- **0% Shared**: Frontend UI (React Web ≠ React Native)
- **Result**: ~60% code reuse across web + mobile

**Pros of this approach**:
✅ Single API layer (maintain once)
✅ Shared types (type safety)
✅ Shared validation (business rules once)
✅ Faster mobile development (2-3 weeks vs 4)
✅ Easier maintenance

**Cons of this approach**:
❌ Different UI frameworks needed
❌ More complex project structure
❌ Steeper learning curve initially

**Alternative (not recommended)**:
- Build separate web + separate mobile with NO sharing
- Result: 100% code duplication, harder to maintain, 8 weeks total
- Not worth it for this project

**My recommendation**: Go with the shared approach. Build web first (4 weeks), then mobile uses 60% shared code (3 weeks).

---

## Next Step

Ready to start? I can begin immediately with:

1. ✅ Create `/apps/admin-web` with Next.js scaffolding
2. ✅ Create `/packages/admin-types` with TypeScript interfaces
3. ✅ Create `/packages/admin-api-client` with HTTP client
4. ✅ Build login page and authentication
5. ✅ Create backend admin endpoints

**What's your decision?** Ready to begin Phase 1?

