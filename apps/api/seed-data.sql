-- Seed data for Country Natural Foods database

-- 1. Insert Certifications (no imageUrl column)
INSERT INTO certifications (id, name, description, "createdAt", "updatedAt") 
VALUES 
  (gen_random_uuid(), 'USDA Organic', 'Certified organic by USDA', NOW(), NOW()),
  (gen_random_uuid(), 'Non-GMO', 'Non-GMO Project Verified', NOW(), NOW()),
  (gen_random_uuid(), 'Gluten Free', 'Certified Gluten Free', NOW(), NOW()),
  (gen_random_uuid(), 'Vegan', 'Certified Vegan Product', NOW(), NOW()),
  (gen_random_uuid(), 'Fair Trade', 'Fair Trade Certified', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 2. Insert Site Settings
INSERT INTO site_settings (id, key, value) 
VALUES 
  (gen_random_uuid(), 'site_name', 'Country Natural Foods'),
  (gen_random_uuid(), 'site_email', 'info@countrynaturalfoods.com'),
  (gen_random_uuid(), 'site_phone', '+1-555-0123'),
  (gen_random_uuid(), 'shipping_fee', '5.99'),
  (gen_random_uuid(), 'free_shipping_threshold', '50.00'),
  (gen_random_uuid(), 'tax_rate', '0.08')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. Insert Categories
INSERT INTO categories (id, name, slug, description, "imageUrl", "sortOrder", "createdAt", "updatedAt") 
VALUES 
  (gen_random_uuid(), 'Cold Pressed Oils', 'cold-pressed-oils', 'Pure, cold-pressed oils', 'https://images.unsplash.com/photo-1587554175346-5c5d5e27c0be?w=500', 1, NOW(), NOW()),
  (gen_random_uuid(), 'Jaggery Varieties', 'jaggery-varieties', 'Traditional jaggery', 'https://images.unsplash.com/photo-1599599810694-e97f8ecc8a9e?w=500', 2, NOW(), NOW()),
  (gen_random_uuid(), 'Homemade Ghee', 'homemade-ghee', 'Pure clarified butter', 'https://images.unsplash.com/photo-1585238341710-4b4d60a91453?w=500', 3, NOW(), NOW()),
  (gen_random_uuid(), 'Organic Millets', 'organic-millets', 'Ancient grains', 'https://images.unsplash.com/photo-1585250481024-e78a94ca4f11?w=500', 4, NOW(), NOW()),
  (gen_random_uuid(), 'Spices & Masalas', 'spices-masalas', 'Aromatic spices', 'https://images.unsplash.com/photo-1596040033229-a0b20e2e5f43?w=500', 5, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- 4. Insert Sample Products (no attributes column, badges is json type)
INSERT INTO products (id, name, slug, description, "shortDescription", ingredients, price, "categoryId", "isFeatured", "isBestSeller", "isLatestArrival", badges, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'Groundnut Oil',
  'groundnut-oil',
  'Cold-pressed groundnut oil rich in vitamin E and antioxidants. Perfect for cooking and health benefits.',
  'Pure groundnut oil',
  'Groundnuts (100%)',
  220.00,
  c.id,
  true,
  true,
  false,
  '["organic", "cold-pressed", "non-gmo"]'::json,
  NOW(),
  NOW()
FROM categories c WHERE c.slug = 'cold-pressed-oils'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, "shortDescription", ingredients, price, "categoryId", "isFeatured", "isBestSeller", "isLatestArrival", badges, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'Coconut Oil',
  'coconut-oil',
  'Pure virgin coconut oil for cooking and skincare. Rich in MCTs and lauric acid.',
  'Virgin coconut oil',
  'Coconuts (100%)',
  400.00,
  c.id,
  true,
  true,
  false,
  '["organic", "premium", "vegan"]'::json,
  NOW(),
  NOW()
FROM categories c WHERE c.slug = 'cold-pressed-oils'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, "shortDescription", ingredients, price, "categoryId", "isFeatured", "isBestSeller", "isLatestArrival", badges, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'Organic Jaggery Powder',
  'organic-jaggery-powder',
  'Pure organic jaggery powder made from sugarcane. Natural sweetener with minerals.',
  'Pure jaggery powder',
  'Organic Sugarcane (100%)',
  180.00,
  c.id,
  true,
  false,
  true,
  '["organic", "natural"]'::json,
  NOW(),
  NOW()
FROM categories c WHERE c.slug = 'jaggery-varieties'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, "shortDescription", ingredients, price, "categoryId", "isFeatured", "isBestSeller", "isLatestArrival", badges, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'Pure Cow Ghee',
  'pure-cow-ghee',
  'Traditional homemade cow ghee made from A2 milk. Rich aroma and taste.',
  'Homemade cow ghee',
  'A2 Cow Milk (100%)',
  550.00,
  c.id,
  true,
  true,
  false,
  '["organic", "premium", "a2-milk"]'::json,
  NOW(),
  NOW()
FROM categories c WHERE c.slug = 'homemade-ghee'
ON CONFLICT (slug) DO NOTHING;

-- 5. Insert Product Variants for each product (no unique constraint on sku, so skip ON CONFLICT)
INSERT INTO product_variants (id, "productId", name, price, sku, "stockQuantity", "discountPrice", discount, "shelfLife", "lowStockThreshold", rating, "reviewCount", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  p.id,
  '500ML',
  220.00,
  'GROUNDNUT-500ML',
  100,
  250.00,
  12,
  '180 DAYS',
  20,
  4.6,
  38,
  NOW(),
  NOW()
FROM products p WHERE p.slug = 'groundnut-oil' AND NOT EXISTS (
  SELECT 1 FROM product_variants WHERE sku = 'GROUNDNUT-500ML'
);

INSERT INTO product_variants (id, "productId", name, price, sku, "stockQuantity", "discountPrice", discount, "shelfLife", "lowStockThreshold", rating, "reviewCount", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  p.id,
  '1000ML',
  410.00,
  'GROUNDNUT-1000ML',
  50,
  450.00,
  5,
  '180 DAYS',
  10,
  4.5,
  24,
  NOW(),
  NOW()
FROM products p WHERE p.slug = 'groundnut-oil' AND NOT EXISTS (
  SELECT 1 FROM product_variants WHERE sku = 'GROUNDNUT-1000ML'
);

INSERT INTO product_variants (id, "productId", name, price, sku, "stockQuantity", "discountPrice", discount, "shelfLife", "lowStockThreshold", rating, "reviewCount", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  p.id,
  '500ML',
  400.00,
  'COCONUT-500ML',
  150,
  450.00,
  12,
  '365 DAYS',
  25,
  4.8,
  92,
  NOW(),
  NOW()
FROM products p WHERE p.slug = 'coconut-oil' AND NOT EXISTS (
  SELECT 1 FROM product_variants WHERE sku = 'COCONUT-500ML'
);

INSERT INTO product_variants (id, "productId", name, price, sku, "stockQuantity", "discountPrice", discount, "shelfLife", "lowStockThreshold", rating, "reviewCount", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  p.id,
  '500G',
  180.00,
  'JAGGERY-500G',
  200,
  200.00,
  10,
  '365 DAYS',
  30,
  4.7,
  65,
  NOW(),
  NOW()
FROM products p WHERE p.slug = 'organic-jaggery-powder' AND NOT EXISTS (
  SELECT 1 FROM product_variants WHERE sku = 'JAGGERY-500G'
);

INSERT INTO product_variants (id, "productId", name, price, sku, "stockQuantity", "discountPrice", discount, "shelfLife", "lowStockThreshold", rating, "reviewCount", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  p.id,
  '500ML',
  550.00,
  'GHEE-500ML',
  75,
  600.00,
  8,
  '180 DAYS',
  15,
  4.9,
  128,
  NOW(),
  NOW()
FROM products p WHERE p.slug = 'pure-cow-ghee' AND NOT EXISTS (
  SELECT 1 FROM product_variants WHERE sku = 'GHEE-500ML'
);

-- 6. Insert Product Images (use altText instead of alt, isDefault instead of isPrimary)
INSERT INTO product_images (id, "productId", "imageUrl", "altText", "isDefault", "displayOrder", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  p.id,
  'https://images.unsplash.com/photo-1587554175346-5c5d5e27c0be?w=800',
  'Groundnut Oil',
  true,
  0,
  NOW(),
  NOW()
FROM products p WHERE p.slug = 'groundnut-oil';

INSERT INTO product_images (id, "productId", "imageUrl", "altText", "isDefault", "displayOrder", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  p.id,
  'https://images.unsplash.com/photo-1585238341710-4b4d60a91453?w=800',
  'Coconut Oil',
  true,
  0,
  NOW(),
  NOW()
FROM products p WHERE p.slug = 'coconut-oil';

INSERT INTO product_images (id, "productId", "imageUrl", "altText", "isDefault", "displayOrder", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  p.id,
  'https://images.unsplash.com/photo-1599599810694-e97f8ecc8a9e?w=800',
  'Organic Jaggery Powder',
  true,
  0,
  NOW(),
  NOW()
FROM products p WHERE p.slug = 'organic-jaggery-powder';

INSERT INTO product_images (id, "productId", "imageUrl", "altText", "isDefault", "displayOrder", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  p.id,
  'https://images.unsplash.com/photo-1585238341710-4b4d60a91453?w=800&q=90',
  'Pure Cow Ghee',
  true,
  0,
  NOW(),
  NOW()
FROM products p WHERE p.slug = 'pure-cow-ghee';

-- Display summary
SELECT 'Data seeded successfully!' as message;
SELECT COUNT(*) as total_categories FROM categories;
SELECT COUNT(*) as total_certifications FROM certifications;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_variants FROM product_variants;
SELECT COUNT(*) as total_images FROM product_images;
SELECT COUNT(*) as total_site_settings FROM site_settings;
