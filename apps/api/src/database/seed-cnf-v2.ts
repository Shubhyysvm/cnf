import { DataSource } from 'typeorm';
import { Product, ProductVariant, Category, ProductImage } from '../entities/product.entity';
import { MasterAdminPreference } from '../entities/master-admin-preference.entity';

export async function seedCNFDatabaseV2(dataSource: DataSource) {
  const categoryRepository = dataSource.getRepository(Category);
  const productRepository = dataSource.getRepository(Product);
  const variantRepository = dataSource.getRepository(ProductVariant);
  const imageRepository = dataSource.getRepository(ProductImage);
  const masterAdminPreferenceRepository = dataSource.getRepository(MasterAdminPreference);

  console.log('🌱 Starting CNF Database Seeding (v2 - Enhanced Schema)...\n');

  // Seed Master Admin Preferences
  const adminEmailExists = await masterAdminPreferenceRepository.findOne({
    where: { key: 'admin_email' },
  });
  if (!adminEmailExists) {
    await masterAdminPreferenceRepository.save({
      key: 'admin_email',
      value: 'hemanthreddy.y143@gmail.com',
      description: 'Primary admin email for order notifications',
    });
    console.log('✅ Seeded admin_email in master_admin_preferences\n');
  }

  const emailFromExists = await masterAdminPreferenceRepository.findOne({
    where: { key: 'email_from' },
  });
  if (!emailFromExists) {
    await masterAdminPreferenceRepository.save({
      key: 'email_from',
      value: 'hemanthreddy.y143@gmail.com',
      description: 'From email address for sending emails',
    });
    console.log('✅ Seeded email_from in master_admin_preferences\n');
  }

  // Social Media Links
  const socialMediaLinks = [
    { key: 'social_facebook', value: 'https://facebook.com/countrynaturalfoods', description: 'Facebook profile URL' },
    { key: 'social_instagram', value: 'https://instagram.com/countrynaturalfoods', description: 'Instagram profile URL' },
    { key: 'social_twitter', value: 'https://twitter.com/cnaturalfoods', description: 'Twitter profile URL' },
    { key: 'social_youtube', value: 'https://youtube.com/@countrynaturalfoods', description: 'YouTube channel URL' },
    { key: 'social_whatsapp', value: 'https://wa.me/918012345678', description: 'WhatsApp contact URL' },
    { key: 'website_url', value: 'https://countrynaturalfoods.com', description: 'Main website URL' },
  ];

  for (const link of socialMediaLinks) {
    const exists = await masterAdminPreferenceRepository.findOne({ where: { key: link.key } });
    if (!exists) {
      await masterAdminPreferenceRepository.save(link);
      console.log(`✅ Seeded ${link.key} in master_admin_preferences`);
    }
  }
  console.log('');

  // Categories (17 total for complete CNF catalog)
  const categories = [
    { name: 'Cold Pressed Oils', slug: 'cold-pressed-oils', description: 'Pure, cold-pressed oils', imageUrl: 'https://images.unsplash.com/photo-1587554175346-5c5d5e27c0be?w=500', sortOrder: 1 },
    { name: 'Jaggery Varieties', slug: 'jaggery-varieties', description: 'Traditional jaggery', imageUrl: 'https://images.unsplash.com/photo-1599599810694-e97f8ecc8a9e?w=500', sortOrder: 2 },
    { name: 'Homemade Ghee', slug: 'homemade-ghee', description: 'Pure clarified butter', imageUrl: 'https://images.unsplash.com/photo-1585238341710-4b4d60a91453?w=500', sortOrder: 3 },
    { name: 'Organic Millets', slug: 'organic-millets', description: 'Ancient grains', imageUrl: 'https://images.unsplash.com/photo-1585250481024-e78a94ca4f11?w=500', sortOrder: 4 },
    { name: 'Dals & Pulses', slug: 'dals-pulses', description: 'Protein-rich lentils', imageUrl: 'https://images.unsplash.com/photo-1599599810500-43b5d1e17f85?w=500', sortOrder: 5 },
    { name: 'Flours & Mixes', slug: 'flours-mixes', description: 'Stone-ground flours', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', sortOrder: 6 },
    { name: 'Spices & Masalas', slug: 'spices-masalas', description: 'Aromatic spices', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a0b20e2e5f43?w=500', sortOrder: 7 },
    { name: 'Seeds & Nuts', slug: 'seeds-nuts', description: 'Nutritious seeds', imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=500', sortOrder: 8 },
    { name: 'Honey & Sweeteners', slug: 'honey-sweeteners', description: 'Natural sweeteners', imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784084?w=500', sortOrder: 9 },
    { name: 'Homemade Soaps', slug: 'homemade-soaps', description: 'Natural soaps', imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500', sortOrder: 10 },
    { name: 'Traditional Sweets', slug: 'traditional-sweets', description: 'Homemade sweets', imageUrl: 'https://images.unsplash.com/photo-1606313564555-47f90e8d4c1d?w=500', sortOrder: 11 },
    { name: 'Rice Varieties', slug: 'rice-varieties', description: 'Organic rice', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', sortOrder: 12 },
    { name: 'Dry Fruits', slug: 'dry-fruits', description: 'Premium dry fruits', imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500', sortOrder: 13 },
    { name: 'Pickles & Chutneys', slug: 'pickles-chutneys', description: 'Homemade pickles', imageUrl: 'https://images.unsplash.com/photo-1601314002592-6c8e0efc34dc?w=500', sortOrder: 14 },
    { name: 'Herbal Products', slug: 'herbal-products', description: 'Ayurvedic herbs', imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500', sortOrder: 15 },
    { name: 'Cold Drinks & Beverages', slug: 'beverages', description: 'Natural drinks', imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500', sortOrder: 16 },
    { name: 'Breakfast & Snacks', slug: 'breakfast-snacks', description: 'Healthy snacks', imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500', sortOrder: 17 },
  ];

  const savedCategories = {};
  for (const catData of categories) {
    let category = await categoryRepository.findOne({ where: { slug: catData.slug } });
    if (!category) {
      category = categoryRepository.create(catData);
    } else {
      Object.assign(category, catData);
    }
    const saved = await categoryRepository.save(category);
    savedCategories[catData.slug] = saved;
  }
  console.log(`✅ ${categories.length} Categories seeded\n`);

  // Enhanced Product Catalog with new fields
  const productsData = [
    // COLD PRESSED OILS (9 products)
    {
      name: 'Groundnut Oil',
      slug: 'groundnut-oil',
      category: 'cold-pressed-oils',
      price: 220,
      description: 'Cold-pressed groundnut oil rich in vitamin E and antioxidants. Perfect for cooking and health benefits.',
      shortDescription: 'Pure groundnut oil',
      ingredients: 'Groundnuts (100%)',
      badges: ['organic'],
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: false,
      attributes: ['Organic', 'Cold-Pressed', 'Non-GMO'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1587554175346-5c5d5e27c0be?w=800', alt: 'Groundnut Oil', isPrimary: true, displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1587554175346-5c5d5e27c0be?w=800&q=80', alt: 'Groundnut Oil Detail', isPrimary: false, displayOrder: 1 },
      ],
      variants: [
        { name: '1000ML', price: 410, sku: 'GROUNDNUT-1000ML', stockQuantity: 50, discountPrice: 450, discount: 5, shelfLife: '180 DAYS', lowStockThreshold: 10, rating: 4.5, reviewCount: 24 },
        { name: '500ML', price: 220, sku: 'GROUNDNUT-500ML', stockQuantity: 100, discountPrice: 250, discount: 12, shelfLife: '180 DAYS', lowStockThreshold: 20, rating: 4.6, reviewCount: 38 },
      ],
    },
    {
      name: 'Coconut Oil',
      slug: 'coconut-oil',
      category: 'cold-pressed-oils',
      price: 400,
      description: 'Pure virgin coconut oil for cooking and skincare. Rich in MCTs and lauric acid.',
      shortDescription: 'Virgin coconut oil',
      ingredients: 'Coconuts (100%)',
      badges: ['organic', 'premium'],
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: false,
      attributes: ['Organic', 'Vegan', 'Paleo-Friendly'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1585238341710-4b4d60a91453?w=800', alt: 'Coconut Oil', isPrimary: true, displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1585238341710-4b4d60a91453?w=800&q=80', alt: 'Coconut Oil Close', isPrimary: false, displayOrder: 1 },
      ],
      variants: [
        { name: '1000ML', price: 800, sku: 'COCONUT-1000ML', stockQuantity: 75, discountPrice: 900, discount: 10, shelfLife: '365 DAYS', lowStockThreshold: 15, rating: 4.7, reviewCount: 56 },
        { name: '500ML', price: 400, sku: 'COCONUT-500ML', stockQuantity: 150, discountPrice: 450, discount: 12, shelfLife: '365 DAYS', lowStockThreshold: 25, rating: 4.8, reviewCount: 92 },
      ],
    },
    {
      name: 'Sesame Oil',
      slug: 'sesame-oil',
      category: 'cold-pressed-oils',
      price: 250,
      description: 'Nutrient-rich cold-pressed sesame oil with nutty flavor. Great for cooking and massage.',
      shortDescription: 'Pure sesame oil',
      ingredients: 'Sesame Seeds (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: true,
      attributes: ['Organic', 'Cold-Pressed'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1606788621632-404c67605ff1?w=800', alt: 'Sesame Oil', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '1000ML', price: 480, sku: 'SESAME-1000ML', stockQuantity: 40, discountPrice: 520, discount: 8, shelfLife: '180 DAYS', lowStockThreshold: 10, rating: 4.4, reviewCount: 18 },
        { name: '500ML', price: 250, sku: 'SESAME-500ML', stockQuantity: 80, discountPrice: 280, discount: 10, shelfLife: '180 DAYS', lowStockThreshold: 15, rating: 4.5, reviewCount: 32 },
      ],
    },
    {
      name: 'Sunflower Oil',
      slug: 'sunflower-oil',
      category: 'cold-pressed-oils',
      price: 180,
      description: 'Light and healthy sunflower oil. Rich in vitamin E and linoleic acid.',
      shortDescription: 'Sunflower oil',
      ingredients: 'Sunflower Seeds (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Organic', 'Non-GMO'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1585237341710-4b4d60a91453?w=800', alt: 'Sunflower Oil', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '1000ML', price: 350, sku: 'SUNFLOWER-1000ML', stockQuantity: 60, discountPrice: 390, discount: 10, shelfLife: '180 DAYS', lowStockThreshold: 15, rating: 4.3, reviewCount: 15 },
        { name: '500ML', price: 180, sku: 'SUNFLOWER-500ML', stockQuantity: 120, discountPrice: 200, discount: 10, shelfLife: '180 DAYS', lowStockThreshold: 20, rating: 4.4, reviewCount: 28 },
      ],
    },
    {
      name: 'Mustard Oil',
      slug: 'mustard-oil',
      category: 'cold-pressed-oils',
      price: 200,
      description: 'Pungent cold-pressed mustard oil with antibacterial properties. Traditional Indian cooking staple.',
      shortDescription: 'Mustard oil',
      ingredients: 'Mustard Seeds (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: true,
      isLatestArrival: false,
      attributes: ['Organic', 'Antibacterial'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1596040033229-a0b20e2e5f43?w=800', alt: 'Mustard Oil', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '1000ML', price: 380, sku: 'MUSTARD-1000ML', stockQuantity: 45, discountPrice: 420, discount: 10, shelfLife: '180 DAYS', lowStockThreshold: 12, rating: 4.2, reviewCount: 12 },
        { name: '500ML', price: 200, sku: 'MUSTARD-500ML', stockQuantity: 90, discountPrice: 220, discount: 9, shelfLife: '180 DAYS', lowStockThreshold: 18, rating: 4.3, reviewCount: 22 },
      ],
    },
    {
      name: 'Castor Oil',
      slug: 'castor-oil',
      category: 'cold-pressed-oils',
      price: 150,
      description: 'Pure castor oil for hair and skin. Traditional remedy for hair growth and skin care.',
      shortDescription: 'Castor oil',
      ingredients: 'Castor Seeds (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Organic', 'Hair-Care', 'Skin-Care'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1584622614875-e4278e6b7e78?w=800', alt: 'Castor Oil', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '500ML', price: 280, sku: 'CASTOR-500ML', stockQuantity: 70, discountPrice: 320, discount: 12, shelfLife: '365 DAYS', lowStockThreshold: 15, rating: 4.6, reviewCount: 45 },
        { name: '250ML', price: 150, sku: 'CASTOR-250ML', stockQuantity: 140, discountPrice: 170, discount: 12, shelfLife: '365 DAYS', lowStockThreshold: 25, rating: 4.7, reviewCount: 78 },
      ],
    },
    {
      name: 'Almond Oil',
      slug: 'almond-oil',
      category: 'cold-pressed-oils',
      price: 350,
      description: 'Premium cold-pressed almond oil. Rich in vitamin E and antioxidants.',
      shortDescription: 'Almond oil',
      ingredients: 'Almonds (100%)',
      badges: ['premium', 'organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: true,
      attributes: ['Premium', 'Organic', 'Antioxidant-Rich'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1600849917128-ce2a77f8e3c3?w=800', alt: 'Almond Oil', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '250ML', price: 650, sku: 'ALMOND-250ML', stockQuantity: 30, discountPrice: 750, discount: 13, shelfLife: '180 DAYS', lowStockThreshold: 8, rating: 4.8, reviewCount: 52 },
        { name: '100ML', price: 350, sku: 'ALMOND-100ML', stockQuantity: 60, discountPrice: 400, discount: 12, shelfLife: '180 DAYS', lowStockThreshold: 15, rating: 4.7, reviewCount: 48 },
      ],
    },
    {
      name: 'Flaxseed Oil',
      slug: 'flaxseed-oil',
      category: 'cold-pressed-oils',
      price: 300,
      description: 'Omega-3 rich flaxseed oil. Great for heart health and inflammation reduction.',
      shortDescription: 'Flaxseed oil',
      ingredients: 'Flax Seeds (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Organic', 'Omega-3', 'Heart-Healthy'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800', alt: 'Flaxseed Oil', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '250ML', price: 550, sku: 'FLAX-250ML', stockQuantity: 25, discountPrice: 600, discount: 8, shelfLife: '90 DAYS', lowStockThreshold: 6, rating: 4.5, reviewCount: 28 },
        { name: '100ML', price: 300, sku: 'FLAX-100ML', stockQuantity: 50, discountPrice: 340, discount: 12, shelfLife: '90 DAYS', lowStockThreshold: 12, rating: 4.4, reviewCount: 38 },
      ],
    },
    {
      name: 'Safflower Oil',
      slug: 'safflower-oil',
      category: 'cold-pressed-oils',
      price: 220,
      description: 'Heart-healthy safflower oil. High in linoleic acid and vitamin E.',
      shortDescription: 'Safflower oil',
      ingredients: 'Safflower Seeds (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Organic', 'Heart-Friendly', 'High-Linoleic'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784084?w=800', alt: 'Safflower Oil', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '1000ML', price: 420, sku: 'SAFFLOWER-1000ML', stockQuantity: 35, discountPrice: 460, discount: 9, shelfLife: '180 DAYS', lowStockThreshold: 10, rating: 4.2, reviewCount: 16 },
        { name: '500ML', price: 220, sku: 'SAFFLOWER-500ML', stockQuantity: 70, discountPrice: 250, discount: 12, shelfLife: '180 DAYS', lowStockThreshold: 15, rating: 4.3, reviewCount: 25 },
      ],
    },
    {
      name: 'Forest Honey',
      slug: 'forest-honey',
      category: 'honey-sweeteners',
      price: 300,
      description: 'Pure raw forest honey. Direct from beehives with no processing.',
      shortDescription: 'Raw forest honey',
      ingredients: 'Honey (100%)',
      badges: ['organic', 'premium'],
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: false,
      attributes: ['Organic', 'Raw', 'Unfiltered'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784084?w=800', alt: 'Forest Honey', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '500G', price: 300, sku: 'HONEY-500G', stockQuantity: 80, discountPrice: 350, discount: 14, shelfLife: '180 DAYS', lowStockThreshold: 20, rating: 4.8, reviewCount: 112 },
        { name: '1000G', price: 600, sku: 'HONEY-1000G', stockQuantity: 50, discountPrice: 700, discount: 14, shelfLife: '180 DAYS', lowStockThreshold: 15, rating: 4.9, reviewCount: 156 },
      ],
    },

    // JAGGERY VARIETIES (6 products)
    {
      name: 'Organic Jaggery Powder',
      slug: 'organic-jaggery-powder',
      category: 'jaggery-varieties',
      price: 90,
      description: 'Pure organic jaggery powder. No chemicals, just pure sugarcane sweetness.',
      shortDescription: 'Organic jaggery powder',
      ingredients: 'Sugarcane (100%)',
      badges: ['organic'],
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: false,
      attributes: ['Organic', 'No-Additives', 'Pure'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1606313564555-47f90e8d4c1d?w=800', alt: 'Jaggery Powder', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '500G', price: 90, sku: 'JAGGERY-500G', stockQuantity: 150, discountPrice: 120, discount: 25, shelfLife: '365 DAYS', lowStockThreshold: 30, rating: 4.6, reviewCount: 68 },
        { name: '1000G', price: 180, sku: 'JAGGERY-1000G', stockQuantity: 100, discountPrice: 240, discount: 25, shelfLife: '365 DAYS', lowStockThreshold: 20, rating: 4.7, reviewCount: 92 },
      ],
    },
    {
      name: 'Jaggery Whole',
      slug: 'jaggery-whole',
      category: 'jaggery-varieties',
      price: 120,
      description: 'Whole jaggery chunks. Traditional preparation method.',
      shortDescription: 'Jaggery chunks',
      ingredients: 'Sugarcane (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: true,
      attributes: ['Organic', 'Traditional'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1606313564555-47f90e8d4c1d?w=800', alt: 'Whole Jaggery', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '900G', price: 120, sku: 'JAGGERY-WHOLE-900G', stockQuantity: 120, discountPrice: 160, discount: 25, shelfLife: '365 DAYS', lowStockThreshold: 25, rating: 4.5, reviewCount: 45 },
      ],
    },
    {
      name: 'Brown Sugar',
      slug: 'brown-sugar',
      category: 'jaggery-varieties',
      price: 120,
      description: 'Organic brown sugar. Natural sweetener alternative.',
      shortDescription: 'Brown sugar',
      ingredients: 'Sugarcane (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Organic', 'Natural'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1606313564555-47f90e8d4c1d?w=800', alt: 'Brown Sugar', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '1000G', price: 120, sku: 'BROWN-SUGAR-1000G', stockQuantity: 100, discountPrice: 160, discount: 25, shelfLife: '365 DAYS', lowStockThreshold: 20, rating: 4.4, reviewCount: 35 },
      ],
    },

    // HOMEMADE GHEE (2 products)
    {
      name: 'Homemade Buffalo Ghee',
      slug: 'buffalo-ghee',
      category: 'homemade-ghee',
      price: 500,
      description: 'Pure buffalo ghee. Rich, golden, and aromatic. Perfect for cooking and health.',
      shortDescription: 'Buffalo ghee',
      ingredients: 'Buffalo Milk (100%)',
      badges: ['premium', 'organic'],
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: false,
      attributes: ['Organic', 'Grass-Fed', 'Premium'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1585238341710-4b4d60a91453?w=800', alt: 'Buffalo Ghee', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '500ML', price: 500, sku: 'BUFFALO-GHEE-500ML', stockQuantity: 60, discountPrice: 600, discount: 17, shelfLife: '180 DAYS', lowStockThreshold: 12, rating: 4.8, reviewCount: 84 },
      ],
    },
    {
      name: 'Homemade Cow Ghee',
      slug: 'cow-ghee',
      category: 'homemade-ghee',
      price: 1000,
      description: 'Pure cow ghee. Traditional preparation. Premium quality.',
      shortDescription: 'Cow ghee',
      ingredients: 'Cow Milk (100%)',
      badges: ['premium', 'organic'],
      isFeatured: true,
      isBestSeller: false,
      isLatestArrival: true,
      attributes: ['Organic', 'Grass-Fed', 'Premium'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1585238341710-4b4d60a91453?w=800', alt: 'Cow Ghee', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '500ML', price: 1000, sku: 'COW-GHEE-500ML', stockQuantity: 40, discountPrice: 1200, discount: 17, shelfLife: '180 DAYS', lowStockThreshold: 8, rating: 4.9, reviewCount: 102 },
      ],
    },

    // ORGANIC MILLETS (10 products)
    {
      name: 'Foxtail Millets',
      slug: 'foxtail-millets',
      category: 'organic-millets',
      price: 80,
      description: 'Nutritious foxtail millets. Ancient grain rich in fiber and minerals.',
      shortDescription: 'Foxtail millets',
      ingredients: 'Foxtail Millets (100%)',
      badges: ['organic'],
      isFeatured: true,
      isBestSeller: false,
      isLatestArrival: true,
      attributes: ['Organic', 'Ancient-Grain', 'Gluten-Free'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', alt: 'Foxtail Millets', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '500G', price: 80, sku: 'FOXTAIL-500G', stockQuantity: 140, discountPrice: 110, discount: 27, shelfLife: '180 DAYS', lowStockThreshold: 30, rating: 4.5, reviewCount: 42 },
        { name: '1000G', price: 140, sku: 'FOXTAIL-1000G', stockQuantity: 100, discountPrice: 190, discount: 26, shelfLife: '180 DAYS', lowStockThreshold: 20, rating: 4.6, reviewCount: 56 },
      ],
    },
    {
      name: 'Kodo Millets',
      slug: 'kodo-millets',
      category: 'organic-millets',
      price: 90,
      description: 'Kodo millets. Excellent source of protein and fiber.',
      shortDescription: 'Kodo millets',
      ingredients: 'Kodo Millets (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Organic', 'High-Protein', 'Gluten-Free'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', alt: 'Kodo Millets', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '500G', price: 90, sku: 'KODO-500G', stockQuantity: 130, discountPrice: 120, discount: 25, shelfLife: '180 DAYS', lowStockThreshold: 25, rating: 4.4, reviewCount: 38 },
        { name: '1000G', price: 160, sku: 'KODO-1000G', stockQuantity: 90, discountPrice: 220, discount: 27, shelfLife: '180 DAYS', lowStockThreshold: 18, rating: 4.5, reviewCount: 48 },
      ],
    },
    {
      name: 'Little Millets',
      slug: 'little-millets',
      category: 'organic-millets',
      price: 90,
      description: 'Little millets. Easy to digest, nutrient-dense grain.',
      shortDescription: 'Little millets',
      ingredients: 'Little Millets (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Organic', 'Digestible', 'Gluten-Free'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', alt: 'Little Millets', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '500G', price: 90, sku: 'LITTLE-500G', stockQuantity: 125, discountPrice: 120, discount: 25, shelfLife: '180 DAYS', lowStockThreshold: 25, rating: 4.4, reviewCount: 35 },
        { name: '1000G', price: 160, sku: 'LITTLE-1000G', stockQuantity: 85, discountPrice: 220, discount: 27, shelfLife: '180 DAYS', lowStockThreshold: 18, rating: 4.5, reviewCount: 44 },
      ],
    },
    {
      name: 'Barnyard Millets',
      slug: 'barnyard-millets',
      category: 'organic-millets',
      price: 90,
      description: 'Barnyard millets. Quick-cooking ancient grain.',
      shortDescription: 'Barnyard millets',
      ingredients: 'Barnyard Millets (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Organic', 'Quick-Cooking', 'Gluten-Free'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', alt: 'Barnyard Millets', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '500G', price: 90, sku: 'BARNYARD-500G', stockQuantity: 120, discountPrice: 120, discount: 25, shelfLife: '180 DAYS', lowStockThreshold: 25, rating: 4.3, reviewCount: 32 },
        { name: '1000G', price: 160, sku: 'BARNYARD-1000G', stockQuantity: 80, discountPrice: 220, discount: 27, shelfLife: '180 DAYS', lowStockThreshold: 18, rating: 4.4, reviewCount: 42 },
      ],
    },
    {
      name: 'Red Rice',
      slug: 'red-rice',
      category: 'rice-varieties',
      price: 90,
      description: 'Organic red rice. Nutrient-dense with anthocyanins.',
      shortDescription: 'Red rice',
      ingredients: 'Red Rice (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Organic', 'Antioxidant-Rich', 'Gluten-Free'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', alt: 'Red Rice', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '500G', price: 90, sku: 'RED-RICE-500G', stockQuantity: 110, discountPrice: 120, discount: 25, shelfLife: '180 DAYS', lowStockThreshold: 22, rating: 4.4, reviewCount: 38 },
        { name: '1000G', price: 160, sku: 'RED-RICE-1000G', stockQuantity: 75, discountPrice: 220, discount: 27, shelfLife: '180 DAYS', lowStockThreshold: 16, rating: 4.5, reviewCount: 48 },
      ],
    },
    {
      name: 'Brown Rice',
      slug: 'brown-rice',
      category: 'rice-varieties',
      price: 60,
      description: 'Organic brown rice. Whole grain with high fiber content.',
      shortDescription: 'Brown rice',
      ingredients: 'Brown Rice (100%)',
      badges: ['organic'],
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: false,
      attributes: ['Organic', 'High-Fiber', 'Gluten-Free'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', alt: 'Brown Rice', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '500G', price: 60, sku: 'BROWN-RICE-500G', stockQuantity: 180, discountPrice: 80, discount: 25, shelfLife: '180 DAYS', lowStockThreshold: 35, rating: 4.6, reviewCount: 78 },
        { name: '1000G', price: 120, sku: 'BROWN-RICE-1000G', stockQuantity: 130, discountPrice: 160, discount: 25, shelfLife: '180 DAYS', lowStockThreshold: 25, rating: 4.7, reviewCount: 105 },
      ],
    },

    // DALS & PULSES (8 products)
    {
      name: 'Toor Dal',
      slug: 'toor-dal',
      category: 'dals-pulses',
      price: 300,
      description: 'Pure toor dal. High protein, easy to digest.',
      shortDescription: 'Toor dal',
      ingredients: 'Toor Lentils (100%)',
      badges: ['organic'],
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: false,
      attributes: ['Organic', 'High-Protein', 'Easy-Digest'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1599599810500-43b5d1e17f85?w=800', alt: 'Toor Dal', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '1000G', price: 300, sku: 'TOOR-1000G', stockQuantity: 120, discountPrice: 360, discount: 17, shelfLife: '180 DAYS', lowStockThreshold: 25, rating: 4.7, reviewCount: 95 },
      ],
    },
    {
      name: 'Red Toor Dal',
      slug: 'red-toor-dal',
      category: 'dals-pulses',
      price: 300,
      description: 'Red toor dal. Traditional variant with rich flavor.',
      shortDescription: 'Red toor dal',
      ingredients: 'Red Toor Lentils (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: true,
      attributes: ['Organic', 'High-Protein', 'Traditional'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1599599810500-43b5d1e17f85?w=800', alt: 'Red Toor Dal', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '1000G', price: 300, sku: 'RED-TOOR-1000G', stockQuantity: 100, discountPrice: 360, discount: 17, shelfLife: '180 DAYS', lowStockThreshold: 20, rating: 4.6, reviewCount: 72 },
      ],
    },
    {
      name: 'Green Gram',
      slug: 'green-gram',
      category: 'dals-pulses',
      price: 180,
      description: 'Whole green gram. Protein-rich, cooling properties.',
      shortDescription: 'Green gram',
      ingredients: 'Green Gram (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Organic', 'High-Protein', 'Cooling'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1599599810500-43b5d1e17f85?w=800', alt: 'Green Gram', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '1000G', price: 180, sku: 'GREEN-GRAM-1000G', stockQuantity: 150, discountPrice: 240, discount: 25, shelfLife: '180 DAYS', lowStockThreshold: 30, rating: 4.5, reviewCount: 58 },
      ],
    },
    {
      name: 'Urad Dal',
      slug: 'urad-dal',
      category: 'dals-pulses',
      price: 260,
      description: 'Split urad dal. Perfect for dosa and idli.',
      shortDescription: 'Urad dal',
      ingredients: 'Urad Lentils (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: true,
      isLatestArrival: false,
      attributes: ['Organic', 'High-Protein', 'For-Idli-Dosa'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1599599810500-43b5d1e17f85?w=800', alt: 'Urad Dal', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '1000G', price: 260, sku: 'URAD-1000G', stockQuantity: 110, discountPrice: 320, discount: 19, shelfLife: '180 DAYS', lowStockThreshold: 22, rating: 4.6, reviewCount: 85 },
      ],
    },
    {
      name: 'Turmeric Powder',
      slug: 'turmeric-powder',
      category: 'spices-masalas',
      price: 140,
      description: 'Pure organic turmeric powder. Anti-inflammatory properties.',
      shortDescription: 'Turmeric powder',
      ingredients: 'Turmeric (100%)',
      badges: ['organic'],
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: false,
      attributes: ['Organic', 'Anti-Inflammatory', 'Ayurvedic'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1596040033229-a0b20e2e5f43?w=800', alt: 'Turmeric Powder', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '500G', price: 140, sku: 'TURMERIC-500G', stockQuantity: 200, discountPrice: 190, discount: 26, shelfLife: '180 DAYS', lowStockThreshold: 40, rating: 4.8, reviewCount: 148 },
      ],
    },
    {
      name: 'Chilli Powder',
      slug: 'chilli-powder',
      category: 'spices-masalas',
      price: 240,
      description: 'Pure Guntur chilli powder. Pungent and aromatic.',
      shortDescription: 'Chilli powder',
      ingredients: 'Chillies (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Organic', 'Pungent', 'Aromatic'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1596040033229-a0b20e2e5f43?w=800', alt: 'Chilli Powder', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '500G', price: 240, sku: 'CHILLI-500G', stockQuantity: 90, discountPrice: 320, discount: 25, shelfLife: '180 DAYS', lowStockThreshold: 18, rating: 4.5, reviewCount: 62 },
      ],
    },

    // HOMEMADE SOAPS (11 products)
    {
      name: 'Wild Turmeric Soap',
      slug: 'wild-turmeric-soap',
      category: 'homemade-soaps',
      price: 110,
      description: 'Traditional wild turmeric soap. Soothing and anti-inflammatory.',
      shortDescription: 'Wild turmeric soap',
      ingredients: 'Wild Turmeric, Coconut Oil, Natural Oils',
      badges: ['organic', 'handmade'],
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: true,
      attributes: ['Handmade', 'Natural', 'Anti-Inflammatory'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800', alt: 'Wild Turmeric Soap', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '100G', price: 110, sku: 'TURMERIC-SOAP-100G', stockQuantity: 200, discountPrice: 150, discount: 27, shelfLife: '24 MONTHS', lowStockThreshold: 40, rating: 4.7, reviewCount: 124 },
      ],
    },
    {
      name: 'Neem Soap',
      slug: 'neem-soap',
      category: 'homemade-soaps',
      price: 100,
      description: 'Pure neem soap. Antibacterial and skin healing.',
      shortDescription: 'Neem soap',
      ingredients: 'Neem, Coconut Oil, Natural Oils',
      badges: ['organic', 'handmade'],
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: false,
      attributes: ['Handmade', 'Natural', 'Antibacterial'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800', alt: 'Neem Soap', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '100G', price: 100, sku: 'NEEM-SOAP-100G', stockQuantity: 220, discountPrice: 140, discount: 29, shelfLife: '24 MONTHS', lowStockThreshold: 45, rating: 4.8, reviewCount: 156 },
      ],
    },
    {
      name: 'Red Sandal Soap',
      slug: 'red-sandal-soap',
      category: 'homemade-soaps',
      price: 90,
      description: 'Traditional red sandal soap. Cooling and moisturizing.',
      shortDescription: 'Red sandal soap',
      ingredients: 'Red Sandal, Coconut Oil, Natural Oils',
      badges: ['organic', 'handmade'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: true,
      attributes: ['Handmade', 'Natural', 'Cooling'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800', alt: 'Red Sandal Soap', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '100G', price: 90, sku: 'SANDAL-SOAP-100G', stockQuantity: 180, discountPrice: 130, discount: 31, shelfLife: '24 MONTHS', lowStockThreshold: 36, rating: 4.6, reviewCount: 98 },
      ],
    },
    {
      name: 'Tulasi Soap',
      slug: 'tulasi-soap',
      category: 'homemade-soaps',
      price: 90,
      description: 'Holy tulasi soap. Antibacterial and purifying.',
      shortDescription: 'Tulasi soap',
      ingredients: 'Tulasi, Coconut Oil, Natural Oils',
      badges: ['organic', 'handmade'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Handmade', 'Natural', 'Purifying'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800', alt: 'Tulasi Soap', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '100G', price: 90, sku: 'TULASI-SOAP-100G', stockQuantity: 160, discountPrice: 130, discount: 31, shelfLife: '24 MONTHS', lowStockThreshold: 32, rating: 4.5, reviewCount: 78 },
      ],
    },
    {
      name: 'Aloe Vera Soap',
      slug: 'aloe-vera-soap',
      category: 'homemade-soaps',
      price: 100,
      description: 'Soothing aloe vera soap. Moisturizing and healing.',
      shortDescription: 'Aloe vera soap',
      ingredients: 'Aloe Vera, Coconut Oil, Natural Oils',
      badges: ['organic', 'handmade'],
      isFeatured: false,
      isBestSeller: true,
      isLatestArrival: false,
      attributes: ['Handmade', 'Natural', 'Moisturizing'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800', alt: 'Aloe Vera Soap', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '100G', price: 100, sku: 'ALOE-SOAP-100G', stockQuantity: 190, discountPrice: 140, discount: 29, shelfLife: '24 MONTHS', lowStockThreshold: 38, rating: 4.7, reviewCount: 112 },
      ],
    },
    {
      name: 'Hibiscus Soap',
      slug: 'hibiscus-soap',
      category: 'homemade-soaps',
      price: 90,
      description: 'Vibrant hibiscus soap. Skin toning and rejuvenating.',
      shortDescription: 'Hibiscus soap',
      ingredients: 'Hibiscus, Coconut Oil, Natural Oils',
      badges: ['organic', 'handmade'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Handmade', 'Natural', 'Rejuvenating'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800', alt: 'Hibiscus Soap', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '100G', price: 90, sku: 'HIBISCUS-SOAP-100G', stockQuantity: 170, discountPrice: 130, discount: 31, shelfLife: '24 MONTHS', lowStockThreshold: 34, rating: 4.5, reviewCount: 68 },
      ],
    },
    {
      name: 'Papaya Soap',
      slug: 'papaya-soap',
      category: 'homemade-soaps',
      price: 110,
      description: 'Papaya enzymes soap. Exfoliating and brightening.',
      shortDescription: 'Papaya soap',
      ingredients: 'Papaya, Coconut Oil, Natural Oils',
      badges: ['organic', 'handmade'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: true,
      attributes: ['Handmade', 'Natural', 'Exfoliating'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800', alt: 'Papaya Soap', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '100G', price: 110, sku: 'PAPAYA-SOAP-100G', stockQuantity: 150, discountPrice: 150, discount: 27, shelfLife: '24 MONTHS', lowStockThreshold: 30, rating: 4.6, reviewCount: 84 },
      ],
    },
    {
      name: 'Sandalwood Soap',
      slug: 'sandalwood-soap',
      category: 'homemade-soaps',
      price: 100,
      description: 'Fragrant sandalwood soap. Calming and luxurious.',
      shortDescription: 'Sandalwood soap',
      ingredients: 'Sandalwood, Coconut Oil, Natural Oils',
      badges: ['premium', 'handmade'],
      isFeatured: true,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Handmade', 'Premium', 'Aromatic'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800', alt: 'Sandalwood Soap', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '100G', price: 100, sku: 'SANDALWOOD-SOAP-100G', stockQuantity: 120, discountPrice: 150, discount: 33, shelfLife: '24 MONTHS', lowStockThreshold: 24, rating: 4.8, reviewCount: 142 },
      ],
    },

    // SEEDS & NUTS (7 products)
    {
      name: 'Sunflower Seeds',
      slug: 'sunflower-seeds',
      category: 'seeds-nuts',
      price: 80,
      description: 'Organic sunflower seeds. Nutrient-rich snack.',
      shortDescription: 'Sunflower seeds',
      ingredients: 'Sunflower Seeds (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Organic', 'Nutrient-Dense', 'Snack'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800', alt: 'Sunflower Seeds', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '100G', price: 80, sku: 'SUNFLOWER-SEEDS-100G', stockQuantity: 140, discountPrice: 110, discount: 27, shelfLife: '180 DAYS', lowStockThreshold: 28, rating: 4.4, reviewCount: 45 },
      ],
    },
    {
      name: 'Flax Seeds',
      slug: 'flax-seeds',
      category: 'seeds-nuts',
      price: 40,
      description: 'Organic flax seeds. Omega-3 rich superfood.',
      shortDescription: 'Flax seeds',
      ingredients: 'Flax Seeds (100%)',
      badges: ['organic'],
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: false,
      attributes: ['Organic', 'Omega-3', 'Superfood'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800', alt: 'Flax Seeds', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '100G', price: 40, sku: 'FLAX-SEEDS-100G', stockQuantity: 250, discountPrice: 60, discount: 33, shelfLife: '180 DAYS', lowStockThreshold: 50, rating: 4.6, reviewCount: 128 },
      ],
    },
    {
      name: 'Chia Seeds',
      slug: 'chia-seeds',
      category: 'seeds-nuts',
      price: 80,
      description: 'Organic chia seeds. High fiber superfood.',
      shortDescription: 'Chia seeds',
      ingredients: 'Chia Seeds (100%)',
      badges: ['organic'],
      isFeatured: true,
      isBestSeller: false,
      isLatestArrival: true,
      attributes: ['Organic', 'High-Fiber', 'Superfood'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800', alt: 'Chia Seeds', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '100G', price: 80, sku: 'CHIA-SEEDS-100G', stockQuantity: 130, discountPrice: 120, discount: 33, shelfLife: '180 DAYS', lowStockThreshold: 26, rating: 4.7, reviewCount: 95 },
      ],
    },
    {
      name: 'Watermelon Seeds',
      slug: 'watermelon-seeds',
      category: 'seeds-nuts',
      price: 90,
      description: 'Organic watermelon seeds. Protein-rich snack.',
      shortDescription: 'Watermelon seeds',
      ingredients: 'Watermelon Seeds (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Organic', 'High-Protein', 'Snack'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800', alt: 'Watermelon Seeds', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '100G', price: 90, sku: 'WATERMELON-SEEDS-100G', stockQuantity: 110, discountPrice: 130, discount: 31, shelfLife: '180 DAYS', lowStockThreshold: 22, rating: 4.3, reviewCount: 38 },
      ],
    },
    {
      name: 'Sabja Seeds',
      slug: 'sabja-seeds',
      category: 'seeds-nuts',
      price: 90,
      description: 'Organic sabja seeds. Cooling and refreshing.',
      shortDescription: 'Sabja seeds',
      ingredients: 'Sabja Seeds (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: true,
      attributes: ['Organic', 'Cooling', 'Refreshing'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800', alt: 'Sabja Seeds', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '100G', price: 90, sku: 'SABJA-SEEDS-100G', stockQuantity: 120, discountPrice: 130, discount: 31, shelfLife: '180 DAYS', lowStockThreshold: 24, rating: 4.2, reviewCount: 32 },
      ],
    },
    {
      name: 'Pumpkin Seeds',
      slug: 'pumpkin-seeds',
      category: 'seeds-nuts',
      price: 100,
      description: 'Organic pumpkin seeds. Zinc and magnesium rich.',
      shortDescription: 'Pumpkin seeds',
      ingredients: 'Pumpkin Seeds (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Organic', 'Mineral-Rich', 'Nutritious'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800', alt: 'Pumpkin Seeds', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '100G', price: 100, sku: 'PUMPKIN-SEEDS-100G', stockQuantity: 100, discountPrice: 140, discount: 29, shelfLife: '180 DAYS', lowStockThreshold: 20, rating: 4.5, reviewCount: 62 },
      ],
    },

    // DOSA & BREAKFAST (6 products)
    {
      name: 'Ragi Dosa Mix',
      slug: 'ragi-dosa-mix',
      category: 'breakfast-snacks',
      price: 50,
      description: 'Ready-to-use ragi dosa mix. Quick and nutritious breakfast.',
      shortDescription: 'Ragi dosa mix',
      ingredients: 'Ragi, Urad Dal, Salt',
      badges: ['organic'],
      isFeatured: true,
      isBestSeller: false,
      isLatestArrival: true,
      attributes: ['Organic', 'Quick-Cooking', 'Nutritious'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800', alt: 'Ragi Dosa Mix', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '500G', price: 100, sku: 'RAGI-DOSA-500G', stockQuantity: 140, discountPrice: 140, discount: 29, shelfLife: '180 DAYS', lowStockThreshold: 28, rating: 4.5, reviewCount: 68 },
      ],
    },
    {
      name: 'Jowar Dosa Mix',
      slug: 'jowar-dosa-mix',
      category: 'breakfast-snacks',
      price: 45,
      description: 'Jowar dosa mix. Ancient grain breakfast option.',
      shortDescription: 'Jowar dosa mix',
      ingredients: 'Jowar, Urad Dal, Salt',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      attributes: ['Organic', 'Ancient-Grain', 'Easy-Digest'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800', alt: 'Jowar Dosa Mix', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '500G', price: 90, sku: 'JOWAR-DOSA-500G', stockQuantity: 130, discountPrice: 130, discount: 31, shelfLife: '180 DAYS', lowStockThreshold: 26, rating: 4.3, reviewCount: 48 },
      ],
    },
    {
      name: 'Ragi Flour',
      slug: 'ragi-flour',
      category: 'flours-mixes',
      price: 50,
      description: 'Pure ragi flour. Stone-ground finger millet flour.',
      shortDescription: 'Ragi flour',
      ingredients: 'Finger Millet (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: true,
      isLatestArrival: false,
      attributes: ['Organic', 'Stone-Ground', 'Gluten-Free'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', alt: 'Ragi Flour', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '500G', price: 50, sku: 'RAGI-FLOUR-500G', stockQuantity: 180, discountPrice: 70, discount: 29, shelfLife: '180 DAYS', lowStockThreshold: 36, rating: 4.6, reviewCount: 92 },
      ],
    },
    {
      name: 'Jowar Flour',
      slug: 'jowar-flour',
      category: 'flours-mixes',
      price: 50,
      description: 'Pure jowar flour. Sorghum grain flour.',
      shortDescription: 'Jowar flour',
      ingredients: 'Sorghum (100%)',
      badges: ['organic'],
      isFeatured: false,
      isBestSeller: true,
      isLatestArrival: false,
      attributes: ['Organic', 'Stone-Ground', 'Gluten-Free'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', alt: 'Jowar Flour', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '500G', price: 50, sku: 'JOWAR-FLOUR-500G', stockQuantity: 170, discountPrice: 70, discount: 29, shelfLife: '180 DAYS', lowStockThreshold: 34, rating: 4.5, reviewCount: 78 },
      ],
    },
    {
      name: 'Wheat Flour',
      slug: 'wheat-flour',
      category: 'flours-mixes',
      price: 100,
      description: 'Organic whole wheat flour. Stone-ground quality.',
      shortDescription: 'Wheat flour',
      ingredients: 'Whole Wheat (100%)',
      badges: ['organic'],
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: false,
      attributes: ['Organic', 'Stone-Ground', 'High-Fiber'],
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', alt: 'Wheat Flour', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '1000G', price: 100, sku: 'WHEAT-FLOUR-1000G', stockQuantity: 200, discountPrice: 140, discount: 29, shelfLife: '180 DAYS', lowStockThreshold: 40, rating: 4.7, reviewCount: 156 },
      ],
    },
  ];

  let totalVariants = 0;
  let totalImages = 0;

  for (const productData of productsData) {
    const { variants, images, attributes, ...prod } = productData;
    const category = savedCategories[prod.category];

    let product = await productRepository.findOne({ where: { slug: prod.slug } });
    if (!product) {
      product = productRepository.create({ ...prod, category });
    } else {
      Object.assign(product, { ...prod, category });
    }
    const savedProduct = await productRepository.save(product);

    // Delete and recreate variants
    await variantRepository.delete({ product: { id: savedProduct.id } });

    for (const varData of variants) {
      const variant = variantRepository.create({ ...varData, product: savedProduct });
      await variantRepository.save(variant);
      totalVariants++;
    }

    // Delete and recreate images
    await imageRepository.delete({ product: { id: savedProduct.id } });

    for (const imgData of images) {
      const image = imageRepository.create({ ...imgData, product: savedProduct });
      await imageRepository.save(image);
      totalImages++;
    }
  }

  console.log(`✅ ${productsData.length} Products seeded`);
  console.log(`✅ ${totalVariants} Variants created`);
  console.log(`✅ ${totalImages} Product Images created\n`);
  console.log('✨ CNF Database Seeding Complete (v2)!\n');
}

