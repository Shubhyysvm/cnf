# 📊 Database Schema & Image System Details

## ProductImage Entity (New Fields Explained)

### Complete Entity Structure

```typescript
@Entity('product_images')
@Index(['productId', 'isDefault'])
export class ProductImage {
  
  id: UUID                    // Unique identifier for each image
                              // Example: "img-a1b2c3d4-e5f6-7890"
  
  productId: UUID             // Foreign key to Product
                              // Links this image to a product
                              // Example: "prod-1234-5678-abcd"
  
  imageUrl: string            // Full URL to the actual image file
                              // Example: "http://localhost:9000/products/1702-abc123.jpg"
                              // This is what you click to see the image
  
  altText: string             // Image description for accessibility & SEO
                              // Example: "Coconut Oil 500ml Cold Pressed"
                              // Shown if image fails to load
  
  fileName: string            // Internal filename in MinIO storage
                              // Example: "1702959203564-a1b2c3d4.jpg"
                              // Used for deleting files
  
  displayOrder: number        // Position in the image gallery
                              // 0 = first image, 1 = second, 2 = third...
                              // Used to sort images for display
  
  isDefault: boolean          // Flag: Is this the featured image?
                              // true = shown on product cards/listings
                              // false = shown only in detail gallery
  
  createdAt: Date             // When the image was uploaded
                              // Auto-set by database
}
```

---

## How Images Map to Products

### Database Relationship

```
┌─────────────────┐         ┌──────────────────┐
│   Product       │         │  ProductImage    │
├─────────────────┤         ├──────────────────┤
│ id: UUID (PK)   │◄────┐   │ id: UUID (PK)    │
│ name: string    │     │   │ productId: UUID  │ ─────┐
│ slug: string    │     │   │ imageUrl: URL    │      │
│ price: decimal  │     │   │ isDefault: bool  │      │
│ ...             │     │   │ displayOrder: #  │      │
│                 │     │   │ ...              │      │
└─────────────────┘     │   └──────────────────┘      │
       ▲                │                             │
       │    (One)       │        (Many)               │
       │                │                             │
       └────────────────┴─────────────────────────────┘

One Product has Many ProductImages
Example:
  Product: Coconut Oil
    ├── Image 1 (isDefault=true,  displayOrder=0)
    ├── Image 2 (isDefault=false, displayOrder=1)
    ├── Image 3 (isDefault=false, displayOrder=2)
    └── Image 4 (isDefault=false, displayOrder=3)
```

---

## Example Data

### Product Table
```sql
SELECT * FROM products WHERE id = 'coconut-oil-uuid';

┌────────────────────┬──────────────┬──────────────────┐
│ id                 │ name         │ slug             │
├────────────────────┼──────────────┼──────────────────┤
│ abc-123-def        │ Coconut Oil  │ coconut-oil      │
└────────────────────┴──────────────┴──────────────────┘
```

### ProductImage Table
```sql
SELECT * FROM product_images WHERE productId = 'abc-123-def'
ORDER BY displayOrder;

┌──────────────┬──────────────┬──────────────────────┬───┬──────────┐
│ id           │ imageUrl     │ altText              │ # │ isDefault│
├──────────────┼──────────────┼──────────────────────┼───┼──────────┤
│ img-001      │ http://...   │ "Coconut Oil 500ml"  │ 0 │ true     │
│ img-002      │ http://...   │ "Bottle close-up"    │ 1 │ false    │
│ img-003      │ http://...   │ "Oil texture"        │ 2 │ false    │
│ img-004      │ http://...   │ "In use"             │ 3 │ false    │
└──────────────┴──────────────┴──────────────────────┴───┴──────────┘
```

---

## How Display Works

### Frontend Logic (Pseudo-code)

```javascript
// On Product Card (Homepage)
function displayProductCard(product) {
  const defaultImage = product.images.find(img => img.isDefault === true);
  return (
    <div>
      <img src={defaultImage.imageUrl} alt={defaultImage.altText} />
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
    </div>
  );
}

// On Product Detail Page
function displayProductGallery(product) {
  const sortedImages = product.images.sort((a, b) => 
    a.displayOrder - b.displayOrder
  );
  return (
    <Gallery>
      {sortedImages.map((img, index) => (
        <GalleryImage key={img.id} src={img.imageUrl} alt={img.altText} />
      ))}
    </Gallery>
  );
}
```

---

## Upload Flow (Step by Step)

```
1. User selects image from computer
   │
   ├─→ File: coconut-oil-500ml.jpg (2.3 MB)
   │
2. POST /products/abc-123-def/images
   │
   ├─→ Multipart form data:
   │   • file: [binary image data]
   │   • isDefault: true
   │   • altText: "Coconut Oil 500ml"
   │
3. API Server receives request
   │
   ├─→ Validates file is image
   ├─→ Generates unique filename: 1702959203564-a1b2c3d4.jpg
   │
4. Upload to MinIO
   │
   ├─→ File stored: /data/products/1702959203564-a1b2c3d4.jpg
   ├─→ Public URL: http://localhost:9000/products/1702959203564-a1b2c3d4.jpg
   │
5. Save to Database
   │
   ├─→ INSERT INTO product_images
   │   (id, productId, imageUrl, altText, displayOrder, isDefault)
   │   VALUES (
   │     'img-001',
   │     'abc-123-def',
   │     'http://localhost:9000/products/1702959203564-a1b2c3d4.jpg',
   │     'Coconut Oil 500ml',
   │     0,
   │     true
   │   )
   │
6. Response to Client
   │
   └─→ { id, imageUrl, displayOrder, isDefault }
```

---

## isDefault Flag Behavior

### What isDefault Does

```
isDefault = true
├─ Shown on Product Card
├─ Shown on Category Page
├─ Shown on Search Results
├─ Shown on Homepage Featured Section
└─ User sees this first on Product Detail

isDefault = false
├─ NOT shown on Product Card
├─ NOT shown on Category Page
├─ Shown ONLY on Product Detail Gallery
├─ User can scroll/click to see these
└─ Supplementary images (back, closeup, etc)
```

### Managing Default Image

```
Scenario: Upload 4 images for Coconut Oil

Image 1 (Front of bottle) → isDefault=true  (shown on card)
Image 2 (Back of bottle) → isDefault=false  (gallery only)
Image 3 (Close-up) → isDefault=false        (gallery only)
Image 4 (In hand) → isDefault=false         (gallery only)

User on Homepage sees: Image 1
User clicks product: Sees all 4 in gallery, starts with Image 1

Later, decide Image 2 (back) looks better for card:
POST /products/.../images/img-002/set-default
→ isDefault changes: img-001=false, img-002=true
→ Homepage now shows Image 2
```

---

## File Storage Location

### MinIO Directory Structure

```
Docker Volume (persistent storage)
└── /data/
    └── products/
        ├── 1702959203564-a1b2c3d4.jpg  (Coconut Oil front)
        ├── 1702959204789-b2c3d4e5.jpg  (Coconut Oil back)
        ├── 1702959205912-c3d4e5f6.jpg  (Coconut Oil close-up)
        ├── 1702959207234-d4e5f6g7.jpg  (Groundnut Oil front)
        └── ... more images ...
```

### URLs Generated

```
For file: 1702959203564-a1b2c3d4.jpg
URL: http://localhost:9000/products/1702959203564-a1b2c3d4.jpg
     └─────┬──────────┘  └──┬──┘  └─────────┬──────────────┘
         Host            Port           Bucket + Filename
```

---

## Indexes (Performance)

```
CREATE INDEX idx_product_images_default 
ON product_images(productId, isDefault);

Why?
• When displaying product card, query: 
  SELECT * FROM product_images 
  WHERE productId = ? AND isDefault = true
  LIMIT 1;
  
• This index makes the query fast (indexed lookup)
• Without it, would scan entire product_images table
```

---

## Key Points

✅ Each product can have unlimited images  
✅ Only one image marked as default  
✅ Others shown in scrollable gallery  
✅ Display order controls gallery sequence  
✅ Images stored in MinIO (separate from DB)  
✅ URLs stored in database for quick access  

---
