# Variant Image Management - Admin Quick Reference

## 🎯 What Changed

The product image system now organizes images by **variant weight** (e.g., 500ml, 1kg) with three image categories:

- **Hero Card**: Main product image (1 per variant, auto-replaces)
- **Info Card**: Secondary info image (1 per variant, auto-replaces)
- **Other Images**: Gallery images (unlimited per variant)

---

## 📁 MinIO Folder Structure

```
products/
  [productId]/
    500ml/
      hero-card/       ← Single hero image
      info-card/       ← Single info image  
      other-images/    ← Gallery images
    1kg/
      hero-card/
      info-card/
      other-images/
```

---

## 🔄 How It Works

### Upload Image to Variant

1. Select product variant (e.g., "500ml")
2. Choose image type:
   - **Hero Card**: Product showcase (auto-replaces previous)
   - **Info Card**: Benefits/features (auto-replaces previous)
   - **Other Images**: Gallery (add unlimited)
3. Select file and click upload

**Result**: Image stored in correct folder structure, auto-replaces if needed

### View/Manage Images

```
Product: Olive Oil
├─ 500ml (Default) ⭐
│  ├─ Hero Card: [1 image]
│  ├─ Info Card: [1 image]
│  └─ Gallery: [5 images - click to reorder]
│
├─ 1kg
│  ├─ Hero Card: [1 image]
│  ├─ Info Card: [1 image]
│  └─ Gallery: [3 images]
│
└─ 2kg (New Variant)
   └─ No images yet
```

---

## ⚡ Key Features

| Feature | Hero Card | Info Card | Other Images |
|---------|-----------|-----------|--------------|
| Max per variant | 1 | 1 | Unlimited |
| Auto-replace | ✅ Yes | ✅ Yes | ❌ No |
| Reorderable | ❌ N/A | ❌ N/A | ✅ Yes |
| Used for | List/homepage | Product detail | Gallery |

---

## 📋 Checklist for Product Setup

When adding images to a new variant:

- [ ] Upload **Hero Card** (main product image)
- [ ] Upload **Info Card** (optional, benefits/features)
- [ ] Upload **Other Images** (gallery photos)
- [ ] Reorder gallery images if needed
- [ ] Click "Save Product"

---

## ❓ FAQ

**Q: What if I upload a 2nd hero card?**  
A: Old one is automatically deleted, new one replaces it.

**Q: Can I reorder gallery images?**  
A: Yes, drag-and-drop in the gallery section (pending UI update).

**Q: What if I delete a variant?**  
A: All variant images are automatically deleted.

**Q: Can I have different images for different variants?**  
A: Yes! Each variant (500ml, 1kg, etc.) has its own separate images.

**Q: Do old products still work?**  
A: Yes! Legacy images without variant info continue to work normally.

---

## 🛠️ API Endpoints (For Developers)

### Upload to Variant
```
POST /admin/products/{productId}/variants/{variantId}/images/{imageType}

imageType: "hero-card" | "info-card" | "other"
Body: FormData with file + altText + displayOrder + variantWeight
```

### Delete from Variant
```
DELETE /admin/products/{productId}/variants/{variantId}/images/{imageType}/{imageId}
```

### Upload to Product (Legacy)
```
POST /admin/products/{productId}/images
Body: FormData with file + altText + displayOrder
```

---

## 📚 Related Docs

- [Full Implementation Details](./VARIANT_IMAGE_STRUCTURE_IMPLEMENTATION.md)
- [Product Image Management BRD](./PRODUCT_IMAGE_MANAGEMENT_BRD.md)
- [Database Schema](../database_schema.sql)

---

**Status**: Phase 1 Implemented ✅  
**Next**: Admin UI Updates (Phase 2)  
**Questions?** Check the full implementation docs
