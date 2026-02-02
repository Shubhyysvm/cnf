# Variant Pricing Auto-Calculation & isDefault Implementation

## Overview
Enhanced the admin product creation page with:
1. Auto-synchronization of price, discount price, and discount percentage
2. Fixed number input clearing issue
3. Added isDefault field for marking default variants
4. Improved variant form inputs for better UX

---

## Changes Made

### 1. Number Input Clearing Fix
**File**: [apps/admin-web/src/app/admin/products/create/page.tsx](apps/admin-web/src/app/admin/products/create/page.tsx)

Changed from:
```tsx
value={variant.price ?? ""}
```

To:
```tsx
value={variant.price === undefined || variant.price === 0 ? "" : variant.price}
```

**Why**: Number inputs in HTML don't handle the `??` operator well for clearing. When you delete the value, it becomes `0`, but `0 ?? ""` still shows `0`. This fix explicitly checks for `0` to allow clearing.

**Applied to all price-related inputs**:
- Price
- Discount Price
- Discount %
- Stock Quantity
- Low Stock Threshold

### 2. Auto-Calculation Logic
**File**: [apps/admin-web/src/app/admin/products/create/page.tsx#L210-L236](apps/admin-web/src/app/admin/products/create/page.tsx#L210-L236)

Added smart synchronization in `updateVariant` function:

```typescript
const updateVariant = (id: string | undefined, key: keyof VariantForm, value: any) => {
  if (!id) return;
  setVariants((prev) =>
    prev.map((v) => {
      if (v._id === id || v.id === id) {
        const updated = { ...v, [key]: value };

        // Auto-calculate discount when price or discountPrice changes
        if (key === "price" || key === "discountPrice") {
          const price = key === "price" ? value : updated.price;
          const discountPrice = key === "discountPrice" ? value : updated.discountPrice;

          if (price && discountPrice && discountPrice > 0) {
            const discountPercent = Math.round(((price - discountPrice) / price) * 100);
            updated.discount = discountPercent;
          }
        }

        // Auto-calculate discountPrice when price or discount changes
        if (key === "price" || key === "discount") {
          const price = key === "price" ? value : updated.price;
          const discount = key === "discount" ? value : updated.discount;

          if (price && discount && discount > 0) {
            const newDiscountPrice = Math.round(price * (1 - discount / 100) * 100) / 100;
            updated.discountPrice = newDiscountPrice;
          }
        }

        return updated;
      }
      return v;
    })
  );
};
```

**How It Works**:
- **When price or discountPrice changes**: Automatically calculate discount % using formula: `((price - discountPrice) / price) * 100`
- **When price or discount % changes**: Automatically calculate new discountPrice using formula: `price * (1 - discount% / 100)`
- Real-time synchronization as user types

### 3. Enhanced Variant Input Fields
**File**: [apps/admin-web/src/app/admin/products/create/page.tsx](apps/admin-web/src/app/admin/products/create/page.tsx)

**Row 1 - Variant Details (3 columns)**:
- Variant Name
- SKU
- Price (MRP)

**Row 2 - Pricing & Stock (3 columns)**:
- Discount Price (auto-calculated)
- Discount % (auto-calculated)
- Stock Quantity

**Row 3 - Additional Info (2 columns)**:
- Low Stock Threshold
- Shelf Life

**Row 4 - Offer Details (2 columns)**:
- Offer Label
- (empty column for balance)

**Row 5 - Flags**:
- Active checkbox
- Default Variant checkbox

### 4. isDefault Field
**File**: [apps/admin-web/src/app/admin/products/create/page.tsx#L850-L860](apps/admin-web/src/app/admin/products/create/page.tsx#L850-L860)

Added checkbox to mark variant as default:
```tsx
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    checked={variant.isDefault === true}
    onChange={(e) => updateVariant(variant._id || variant.id, "isDefault", e.target.checked)}
    className="w-4 h-4 rounded border-gray-300 text-emerald-600"
  />
  <span className="text-sm font-medium text-gray-800">Default Variant</span>
</label>
```

### 5. Updated Variant Payload
**File**: [apps/admin-web/src/app/admin/products/create/page.tsx#L315-L330](apps/admin-web/src/app/admin/products/create/page.tsx#L315-L330)

When saving additional variants:
```typescript
await apiClient.variants.create(productId, {
  name: variant.name || "",
  sku: variant.sku || "",
  price: variant.price || 0,
  discountPrice: variant.discountPrice || undefined,
  discount: variant.discount || undefined,
  offer: variant.offer || undefined,
  stockQuantity: variant.stockQuantity || 0,
  lowStockThreshold: variant.lowStockThreshold || 0,
  shelfLife: variant.shelfLife || undefined,
  isActive: variant.isActive !== false,
  isDefault: variant.isDefault === true,  // ← New field
} as any);
```

---

## Field Relationships & Auto-Calculation

### Price Fields:
- **Price (MRP)**: The base/original price
- **Discount Price**: The selling price (always ≤ Price)
- **Discount %**: The percentage off (0-100%)

### Auto-Calculation Rules:
1. **If user enters Price + Discount Price** → Discount % is calculated
2. **If user enters Price + Discount %** → Discount Price is calculated
3. **If user changes any field** → Related fields update in real-time

### Example Flow:
```
User enters: Price = 1000, Discount % = 20
System calculates: Discount Price = 1000 × (1 - 20/100) = 800

User changes: Discount Price = 750
System calculates: Discount % = (1000 - 750) / 1000 × 100 = 25%
```

---

## Testing Checklist
- [x] Can now delete price value completely (no stuck 0)
- [x] Discount % auto-calculates when price and discount price are entered
- [x] Discount price auto-calculates when price and discount % are entered
- [x] isDefault checkbox appears for each variant
- [x] Form fields are properly labeled and positioned
- [x] All fields save correctly to the API

---

## Future Enhancements
- [ ] Implement same auto-calculation logic in edit product page
- [ ] Add validation to ensure discountPrice ≤ price
- [ ] Visual indicators showing calculated fields vs user-entered
- [ ] Redesign edit product page to match add product layout with tabs
- [ ] Add bulk variant operations

---

## Next Steps for Edit Product Page
1. Duplicate the auto-calculation logic to edit page
2. Refactor both to use shared utility functions
3. Redesign edit page with tabs like add product page
4. Implement variant editing with same UX improvements

