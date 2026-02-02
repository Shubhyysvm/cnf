import { DataSource } from 'typeorm';
import { Product, ProductVariant, Category, ProductImage } from '../entities/product.entity';

export async function seedCNFDatabase(dataSource: DataSource) {
  const categoryRepository = dataSource.getRepository(Category);
  const productRepository = dataSource.getRepository(Product);
  const variantRepository = dataSource.getRepository(ProductVariant);
  const imageRepository = dataSource.getRepository(ProductImage);

  console.log(' Starting CNF Database Seeding...\n');

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
  console.log(`? ${categories.length} Categories seeded\n`);

  // Complete CNF Product Catalog (48 products, 145+ variants)
  const productsData = [
    // COLD PRESSED OILS (9 products)
    { name: 'Groundnut Oil', slug: 'groundnut-oil', category: 'cold-pressed-oils', price: 220, description: 'Cold-pressed groundnut oil rich in vitamin E', shortDescription: 'Pure groundnut oil', ingredients: 'Groundnuts', shelfLife: '180 DAYS', badges: ['organic'], isFeatured: true, variants: [{ name: '1000ML', weight: '1000ML', price: 410, sku: 'GROUNDNUT-1000ML', stockQuantity: 50 }, { name: '500ML', weight: '500ML', price: 220, sku: 'GROUNDNUT-500ML', stockQuantity: 100 }] },
    { name: 'Coconut Oil', slug: 'coconut-oil', category: 'cold-pressed-oils', price: 400, description: 'Pure virgin coconut oil for cooking and skincare', shortDescription: 'Virgin coconut oil', ingredients: 'Coconuts', shelfLife: '365 DAYS', badges: ['organic'], isFeatured: true, variants: [{ name: '1000ML', weight: '1000ML', price: 800, sku: 'COCONUT-1000ML', stockQuantity: 75 }, { name: '500ML', weight: '500ML', price: 400, sku: 'COCONUT-500ML', stockQuantity: 150 }] },
    { name: 'Sesame Oil', slug: 'sesame-oil', category: 'cold-pressed-oils', price: 250, description: 'Nutrient-rich cold-pressed sesame oil', shortDescription: 'Pure sesame oil', ingredients: 'Sesame Seeds', shelfLife: '180 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000ML', weight: '1000ML', price: 480, sku: 'SESAME-1000ML', stockQuantity: 40 }, { name: '500ML', weight: '500ML', price: 250, sku: 'SESAME-500ML', stockQuantity: 80 }] },
    { name: 'Sunflower Oil', slug: 'sunflower-oil', category: 'cold-pressed-oils', price: 180, description: 'Light and healthy sunflower oil', shortDescription: 'Sunflower oil', ingredients: 'Sunflower Seeds', shelfLife: '180 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000ML', weight: '1000ML', price: 350, sku: 'SUNFLOWER-1000ML', stockQuantity: 60 }, { name: '500ML', weight: '500ML', price: 180, sku: 'SUNFLOWER-500ML', stockQuantity: 120 }] },
    { name: 'Mustard Oil', slug: 'mustard-oil', category: 'cold-pressed-oils', price: 200, description: 'Pungent cold-pressed mustard oil', shortDescription: 'Mustard oil', ingredients: 'Mustard Seeds', shelfLife: '180 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000ML', weight: '1000ML', price: 380, sku: 'MUSTARD-1000ML', stockQuantity: 45 }, { name: '500ML', weight: '500ML', price: 200, sku: 'MUSTARD-500ML', stockQuantity: 90 }] },
    { name: 'Castor Oil', slug: 'castor-oil', category: 'cold-pressed-oils', price: 150, description: 'Pure castor oil for hair and skin', shortDescription: 'Castor oil', ingredients: 'Castor Seeds', shelfLife: '365 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '500ML', weight: '500ML', price: 280, sku: 'CASTOR-500ML', stockQuantity: 70 }, { name: '250ML', weight: '250ML', price: 150, sku: 'CASTOR-250ML', stockQuantity: 140 }] },
    { name: 'Almond Oil', slug: 'almond-oil', category: 'cold-pressed-oils', price: 350, description: 'Premium cold-pressed almond oil', shortDescription: 'Almond oil', ingredients: 'Almonds', shelfLife: '180 DAYS', badges: ['premium'], isFeatured: false, variants: [{ name: '250ML', weight: '250ML', price: 650, sku: 'ALMOND-250ML', stockQuantity: 30 }, { name: '100ML', weight: '100ML', price: 350, sku: 'ALMOND-100ML', stockQuantity: 60 }] },
    { name: 'Flaxseed Oil', slug: 'flaxseed-oil', category: 'cold-pressed-oils', price: 300, description: 'Omega-3 rich flaxseed oil', shortDescription: 'Flaxseed oil', ingredients: 'Flax Seeds', shelfLife: '90 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '250ML', weight: '250ML', price: 550, sku: 'FLAX-250ML', stockQuantity: 25 }, { name: '100ML', weight: '100ML', price: 300, sku: 'FLAX-100ML', stockQuantity: 50 }] },
    { name: 'Safflower Oil', slug: 'safflower-oil', category: 'cold-pressed-oils', price: 220, description: 'Heart-healthy safflower oil', shortDescription: 'Safflower oil', ingredients: 'Safflower Seeds', shelfLife: '180 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000ML', weight: '1000ML', price: 420, sku: 'SAFFLOWER-1000ML', stockQuantity: 35 }, { name: '500ML', weight: '500ML', price: 220, sku: 'SAFFLOWER-500ML', stockQuantity: 70 }] },

    // JAGGERY VARIETIES (5 products)
    { name: 'Organic Jaggery Powder', slug: 'jaggery-powder', category: 'jaggery-varieties', price: 90, description: 'Fine organic jaggery powder', shortDescription: 'Jaggery powder', ingredients: 'Sugarcane', shelfLife: '365 DAYS', badges: ['organic'], isFeatured: true, variants: [{ name: '1000G', weight: '1000G', price: 180, sku: 'JAG-POW-1000G', stockQuantity: 100 }, { name: '500G', weight: '500G', price: 90, sku: 'JAG-POW-500G', stockQuantity: 200 }] },
    { name: 'Jaggery Cubes', slug: 'jaggery-cubes', category: 'jaggery-varieties', price: 95, description: 'Traditional jaggery in cube form', shortDescription: 'Jaggery cubes', ingredients: 'Sugarcane', shelfLife: '365 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000G', weight: '1000G', price: 190, sku: 'JAG-CUBE-1000G', stockQuantity: 80 }, { name: '500G', weight: '500G', price: 95, sku: 'JAG-CUBE-500G', stockQuantity: 160 }] },
    { name: 'Palm Jaggery', slug: 'palm-jaggery', category: 'jaggery-varieties', price: 120, description: 'Rich palm jaggery from date palms', shortDescription: 'Palm jaggery', ingredients: 'Date Palm Sap', shelfLife: '365 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '500G', weight: '500G', price: 230, sku: 'PALM-JAG-500G', stockQuantity: 60 }, { name: '250G', weight: '250G', price: 120, sku: 'PALM-JAG-250G', stockQuantity: 120 }] },
    { name: 'Jaggery Ginger Cubes', slug: 'jaggery-ginger-cubes', category: 'jaggery-varieties', price: 110, description: 'Jaggery infused with ginger', shortDescription: 'Ginger jaggery', ingredients: 'Sugarcane, Ginger', shelfLife: '180 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '500G', weight: '500G', price: 210, sku: 'JAG-GING-500G', stockQuantity: 50 }, { name: '250G', weight: '250G', price: 110, sku: 'JAG-GING-250G', stockQuantity: 100 }] },
    { name: 'Brown Sugar', slug: 'brown-sugar', category: 'jaggery-varieties', price: 80, description: 'Unrefined brown sugar', shortDescription: 'Brown sugar', ingredients: 'Sugarcane', shelfLife: '365 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000G', weight: '1000G', price: 160, sku: 'BROWN-1000G', stockQuantity: 90 }, { name: '500G', weight: '500G', price: 80, sku: 'BROWN-500G', stockQuantity: 180 }] },

    // HOMEMADE GHEE (2 products)
    { name: 'Cow Ghee', slug: 'cow-ghee', category: 'homemade-ghee', price: 450, description: 'Pure cow ghee made from A2 milk', shortDescription: 'A2 cow ghee', ingredients: 'Cow Milk', shelfLife: '365 DAYS', badges: ['organic', 'premium'], isFeatured: true, variants: [{ name: '1000ML', weight: '1000ML', price: 850, sku: 'COW-GHEE-1000ML', stockQuantity: 40 }, { name: '500ML', weight: '500ML', price: 450, sku: 'COW-GHEE-500ML', stockQuantity: 80 }] },
    { name: 'Buffalo Ghee', slug: 'buffalo-ghee', category: 'homemade-ghee', price: 400, description: 'Traditional buffalo ghee', shortDescription: 'Buffalo ghee', ingredients: 'Buffalo Milk', shelfLife: '365 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000ML', weight: '1000ML', price: 750, sku: 'BUFF-GHEE-1000ML', stockQuantity: 35 }, { name: '500ML', weight: '500ML', price: 400, sku: 'BUFF-GHEE-500ML', stockQuantity: 70 }] },

    // ORGANIC MILLETS (6 products)
    { name: 'Foxtail Millet', slug: 'foxtail-millet', category: 'organic-millets', price: 80, description: 'Nutritious foxtail millet grains', shortDescription: 'Foxtail millet', ingredients: 'Foxtail Millet', shelfLife: '180 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000G', weight: '1000G', price: 150, sku: 'FOXTAIL-1000G', stockQuantity: 60 }, { name: '500G', weight: '500G', price: 80, sku: 'FOXTAIL-500G', stockQuantity: 120 }] },
    { name: 'Barnyard Millet', slug: 'barnyard-millet', category: 'organic-millets', price: 85, description: 'Low glycemic index barnyard millet', shortDescription: 'Barnyard millet', ingredients: 'Barnyard Millet', shelfLife: '180 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000G', weight: '1000G', price: 160, sku: 'BARNYARD-1000G', stockQuantity: 50 }, { name: '500G', weight: '500G', price: 85, sku: 'BARNYARD-500G', stockQuantity: 100 }] },
    { name: 'Little Millet', slug: 'little-millet', category: 'organic-millets', price: 75, description: 'Tiny nutrient-packed millet grains', shortDescription: 'Little millet', ingredients: 'Little Millet', shelfLife: '180 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000G', weight: '1000G', price: 140, sku: 'LITTLE-1000G', stockQuantity: 55 }, { name: '500G', weight: '500G', price: 75, sku: 'LITTLE-500G', stockQuantity: 110 }] },
    { name: 'Pearl Millet (Bajra)', slug: 'pearl-millet', category: 'organic-millets', price: 70, description: 'Iron-rich pearl millet', shortDescription: 'Bajra', ingredients: 'Pearl Millet', shelfLife: '180 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000G', weight: '1000G', price: 130, sku: 'PEARL-1000G', stockQuantity: 70 }, { name: '500G', weight: '500G', price: 70, sku: 'PEARL-500G', stockQuantity: 140 }] },
    { name: 'Finger Millet (Ragi)', slug: 'finger-millet', category: 'organic-millets', price: 75, description: 'Calcium-rich ragi flour', shortDescription: 'Ragi', ingredients: 'Finger Millet', shelfLife: '180 DAYS', badges: ['organic'], isFeatured: true, variants: [{ name: '1000G', weight: '1000G', price: 140, sku: 'RAGI-1000G', stockQuantity: 80 }, { name: '500G', weight: '500G', price: 75, sku: 'RAGI-500G', stockQuantity: 160 }] },
    { name: 'Proso Millet', slug: 'proso-millet', category: 'organic-millets', price: 80, description: 'Protein-rich proso millet', shortDescription: 'Proso millet', ingredients: 'Proso Millet', shelfLife: '180 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000G', weight: '1000G', price: 150, sku: 'PROSO-1000G', stockQuantity: 45 }, { name: '500G', weight: '500G', price: 80, sku: 'PROSO-500G', stockQuantity: 90 }] },

    // DALS & PULSES (5 products)
    { name: 'Toor Dal', slug: 'toor-dal', category: 'dals-pulses', price: 120, description: 'Premium quality toor dal', shortDescription: 'Toor dal', ingredients: 'Toor Lentils', shelfLife: '365 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000G', weight: '1000G', price: 230, sku: 'TOOR-1000G', stockQuantity: 100 }, { name: '500G', weight: '500G', price: 120, sku: 'TOOR-500G', stockQuantity: 200 }] },
    { name: 'Moong Dal', slug: 'moong-dal', category: 'dals-pulses', price: 130, description: 'Split green gram dal', shortDescription: 'Moong dal', ingredients: 'Green Gram', shelfLife: '365 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000G', weight: '1000G', price: 250, sku: 'MOONG-1000G', stockQuantity: 90 }, { name: '500G', weight: '500G', price: 130, sku: 'MOONG-500G', stockQuantity: 180 }] },
    { name: 'Urad Dal', slug: 'urad-dal', category: 'dals-pulses', price: 140, description: 'Black gram split dal', shortDescription: 'Urad dal', ingredients: 'Black Gram', shelfLife: '365 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000G', weight: '1000G', price: 270, sku: 'URAD-1000G', stockQuantity: 85 }, { name: '500G', weight: '500G', price: 140, sku: 'URAD-500G', stockQuantity: 170 }] },
    { name: 'Masoor Dal', slug: 'masoor-dal', category: 'dals-pulses', price: 110, description: 'Red lentils dal', shortDescription: 'Masoor dal', ingredients: 'Red Lentils', shelfLife: '365 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000G', weight: '1000G', price: 210, sku: 'MASOOR-1000G', stockQuantity: 95 }, { name: '500G', weight: '500G', price: 110, sku: 'MASOOR-500G', stockQuantity: 190 }] },
    { name: 'Chana Dal', slug: 'chana-dal', category: 'dals-pulses', price: 100, description: 'Split chickpea dal', shortDescription: 'Chana dal', ingredients: 'Chickpeas', shelfLife: '365 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000G', weight: '1000G', price: 190, sku: 'CHANA-1000G', stockQuantity: 105 }, { name: '500G', weight: '500G', price: 100, sku: 'CHANA-500G', stockQuantity: 210 }] },

    // SPICES & MASALAS (6 products)
    { name: 'Turmeric Powder', slug: 'turmeric-powder', category: 'spices-masalas', price: 140, description: 'Pure turmeric powder', shortDescription: 'Turmeric powder', ingredients: 'Turmeric', shelfLife: '180 DAYS', badges: ['organic'], isFeatured: true, variants: [{ name: '500G', weight: '500G', price: 270, sku: 'TURMERIC-500G', stockQuantity: 150 }, { name: '250G', weight: '250G', price: 140, sku: 'TURMERIC-250G', stockQuantity: 300 }] },
    { name: 'Red Chilli Powder', slug: 'chilli-powder', category: 'spices-masalas', price: 160, description: 'Spicy red chilli powder', shortDescription: 'Chilli powder', ingredients: 'Red Chillies', shelfLife: '180 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '500G', weight: '500G', price: 310, sku: 'CHILLI-500G', stockQuantity: 120 }, { name: '250G', weight: '250G', price: 160, sku: 'CHILLI-250G', stockQuantity: 240 }] },
    { name: 'Coriander Powder', slug: 'coriander-powder', category: 'spices-masalas', price: 90, description: 'Aromatic coriander powder', shortDescription: 'Coriander powder', ingredients: 'Coriander Seeds', shelfLife: '180 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '500G', weight: '500G', price: 170, sku: 'CORIANDER-500G', stockQuantity: 130 }, { name: '250G', weight: '250G', price: 90, sku: 'CORIANDER-250G', stockQuantity: 260 }] },
    { name: 'Cumin Powder', slug: 'cumin-powder', category: 'spices-masalas', price: 180, description: 'Fragrant cumin powder', shortDescription: 'Cumin powder', ingredients: 'Cumin Seeds', shelfLife: '180 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '250G', weight: '250G', price: 340, sku: 'CUMIN-250G', stockQuantity: 100 }, { name: '100G', weight: '100G', price: 180, sku: 'CUMIN-100G', stockQuantity: 200 }] },
    { name: 'Garam Masala', slug: 'garam-masala', category: 'spices-masalas', price: 220, description: 'Aromatic spice blend', shortDescription: 'Garam masala', ingredients: 'Mixed Spices', shelfLife: '180 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '250G', weight: '250G', price: 410, sku: 'GARAM-250G', stockQuantity: 80 }, { name: '100G', weight: '100G', price: 220, sku: 'GARAM-100G', stockQuantity: 160 }] },
    { name: 'Black Pepper Powder', slug: 'black-pepper', category: 'spices-masalas', price: 300, description: 'Premium black pepper powder', shortDescription: 'Black pepper', ingredients: 'Black Pepper', shelfLife: '180 DAYS', badges: ['premium'], isFeatured: false, variants: [{ name: '250G', weight: '250G', price: 580, sku: 'PEPPER-250G', stockQuantity: 60 }, { name: '100G', weight: '100G', price: 300, sku: 'PEPPER-100G', stockQuantity: 120 }] },

    // HOMEMADE SOAPS (5 products)
    { name: 'Wild Turmeric Soap', slug: 'wild-turmeric-soap', category: 'homemade-soaps', price: 110, description: 'Premium soap with wild turmeric', shortDescription: 'Wild turmeric soap', ingredients: 'Natural oils, Wild Turmeric', shelfLife: '24 MONTHS', badges: ['natural'], isFeatured: true, variants: [{ name: '100G', weight: '100G', price: 110, sku: 'WILD-TURMERIC-100G', stockQuantity: 200 }] },
    { name: 'Neem Soap', slug: 'neem-soap', category: 'homemade-soaps', price: 90, description: 'Antibacterial neem soap', shortDescription: 'Neem soap', ingredients: 'Neem Oil, Coconut Oil', shelfLife: '24 MONTHS', badges: ['natural'], isFeatured: false, variants: [{ name: '100G', weight: '100G', price: 90, sku: 'NEEM-SOAP-100G', stockQuantity: 250 }] },
    { name: 'Sandalwood Soap', slug: 'sandalwood-soap', category: 'homemade-soaps', price: 120, description: 'Fragrant sandalwood soap', shortDescription: 'Sandalwood soap', ingredients: 'Sandalwood Powder, Natural Oils', shelfLife: '24 MONTHS', badges: ['natural', 'premium'], isFeatured: false, variants: [{ name: '100G', weight: '100G', price: 120, sku: 'SANDAL-100G', stockQuantity: 150 }] },
    { name: 'Aloe Vera Soap', slug: 'aloe-vera-soap', category: 'homemade-soaps', price: 95, description: 'Soothing aloe vera soap', shortDescription: 'Aloe vera soap', ingredients: 'Aloe Vera Gel, Natural Oils', shelfLife: '24 MONTHS', badges: ['natural'], isFeatured: false, variants: [{ name: '100G', weight: '100G', price: 95, sku: 'ALOE-SOAP-100G', stockQuantity: 180 }] },
    { name: 'Charcoal Soap', slug: 'charcoal-soap', category: 'homemade-soaps', price: 100, description: 'Detoxifying charcoal soap', shortDescription: 'Charcoal soap', ingredients: 'Activated Charcoal, Natural Oils', shelfLife: '24 MONTHS', badges: ['natural'], isFeatured: false, variants: [{ name: '100G', weight: '100G', price: 100, sku: 'CHARCOAL-100G', stockQuantity: 170 }] },

    // HONEY & SWEETENERS (3 products)
    { name: 'Forest Honey', slug: 'forest-honey', category: 'honey-sweeteners', price: 300, description: 'Raw wild forest honey', shortDescription: 'Forest honey', ingredients: 'Wild Honey', shelfLife: '730 DAYS', badges: ['organic', 'premium'], isFeatured: true, variants: [{ name: '500G', weight: '500G', price: 580, sku: 'FOREST-500G', stockQuantity: 40 }, { name: '250G', weight: '250G', price: 300, sku: 'FOREST-250G', stockQuantity: 80 }] },
    { name: 'Multi-Flower Honey', slug: 'multi-flower-honey', category: 'honey-sweeteners', price: 250, description: 'Pure multi-floral honey', shortDescription: 'Multi-flower honey', ingredients: 'Honey', shelfLife: '730 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '500G', weight: '500G', price: 480, sku: 'MULTI-500G', stockQuantity: 50 }, { name: '250G', weight: '250G', price: 250, sku: 'MULTI-250G', stockQuantity: 100 }] },
    { name: 'Date Syrup', slug: 'date-syrup', category: 'honey-sweeteners', price: 180, description: 'Natural date syrup sweetener', shortDescription: 'Date syrup', ingredients: 'Dates', shelfLife: '365 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '500ML', weight: '500ML', price: 340, sku: 'DATE-500ML', stockQuantity: 45 }, { name: '250ML', weight: '250ML', price: 180, sku: 'DATE-250ML', stockQuantity: 90 }] },

    // TRADITIONAL SWEETS (3 products)
    { name: 'Til Laddu', slug: 'til-laddu', category: 'traditional-sweets', price: 150, description: 'Traditional sesame laddus', shortDescription: 'Sesame laddus', ingredients: 'Sesame, Jaggery', shelfLife: '30 DAYS', badges: ['homemade'], isFeatured: false, variants: [{ name: '500G', weight: '500G', price: 280, sku: 'TIL-LADDU-500G', stockQuantity: 30 }, { name: '250G', weight: '250G', price: 150, sku: 'TIL-LADDU-250G', stockQuantity: 60 }] },
    { name: 'Dry Fruit Barfi', slug: 'dry-fruit-barfi', category: 'traditional-sweets', price: 400, description: 'Premium dry fruit barfi', shortDescription: 'Dry fruit barfi', ingredients: 'Mixed Nuts, Sugar', shelfLife: '15 DAYS', badges: ['homemade', 'premium'], isFeatured: false, variants: [{ name: '500G', weight: '500G', price: 780, sku: 'BARFI-500G', stockQuantity: 20 }, { name: '250G', weight: '250G', price: 400, sku: 'BARFI-250G', stockQuantity: 40 }] },
    { name: 'Peanut Chikki', slug: 'peanut-chikki', category: 'traditional-sweets', price: 120, description: 'Crunchy peanut jaggery bars', shortDescription: 'Peanut chikki', ingredients: 'Peanuts, Jaggery', shelfLife: '60 DAYS', badges: ['homemade'], isFeatured: false, variants: [{ name: '500G', weight: '500G', price: 220, sku: 'CHIKKI-500G', stockQuantity: 50 }, { name: '250G', weight: '250G', price: 120, sku: 'CHIKKI-250G', stockQuantity: 100 }] },

    // FLOURS & MIXES (4 products)
    { name: 'Wheat Flour', slug: 'wheat-flour', category: 'flours-mixes', price: 60, description: 'Stone-ground whole wheat flour', shortDescription: 'Wheat flour', ingredients: 'Whole Wheat', shelfLife: '90 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '5000G', weight: '5000G', price: 280, sku: 'WHEAT-5000G', stockQuantity: 80 }, { name: '1000G', weight: '1000G', price: 60, sku: 'WHEAT-1000G', stockQuantity: 160 }] },
    { name: 'Rice Flour', slug: 'rice-flour', category: 'flours-mixes', price: 55, description: 'Fine rice flour', shortDescription: 'Rice flour', ingredients: 'Rice', shelfLife: '90 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000G', weight: '1000G', price: 105, sku: 'RICE-FLOUR-1000G', stockQuantity: 90 }, { name: '500G', weight: '500G', price: 55, sku: 'RICE-FLOUR-500G', stockQuantity: 180 }] },
    { name: 'Gram Flour (Besan)', slug: 'gram-flour', category: 'flours-mixes', price: 70, description: 'Pure chickpea flour', shortDescription: 'Besan', ingredients: 'Chickpeas', shelfLife: '90 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000G', weight: '1000G', price: 130, sku: 'BESAN-1000G', stockQuantity: 100 }, { name: '500G', weight: '500G', price: 70, sku: 'BESAN-500G', stockQuantity: 200 }] },
    { name: 'Ragi Flour', slug: 'ragi-flour', category: 'flours-mixes', price: 75, description: 'Nutritious finger millet flour', shortDescription: 'Ragi flour', ingredients: 'Finger Millet', shelfLife: '90 DAYS', badges: ['organic'], isFeatured: false, variants: [{ name: '1000G', weight: '1000G', price: 140, sku: 'RAGI-FLOUR-1000G', stockQuantity: 70 }, { name: '500G', weight: '500G', price: 75, sku: 'RAGI-FLOUR-500G', stockQuantity: 140 }] },
  ];

  let totalVariants = 0;
  for (const productData of productsData) {
    const { variants, ...prod } = productData;
    const category = savedCategories[prod.category];

    let product = await productRepository.findOne({ where: { slug: prod.slug } });
    if (!product) {
      product = productRepository.create({ ...prod, category });
    } else {
      Object.assign(product, prod);
      product.category = category;
    }
    const savedProduct = await productRepository.save(product);

    await variantRepository.delete({ product: { id: savedProduct.id } });

    for (const varData of variants) {
      // Add productName to each variant (denormalized for clarity)
      const variant = variantRepository.create({ 
        ...varData, 
        productName: savedProduct.name,
        product: savedProduct 
      });
      await variantRepository.save(variant);
      totalVariants++;
    }
  }

  console.log(`? ${productsData.length} Products seeded with ${totalVariants} variants\n`);
  console.log('? CNF Database Seeding Complete!\n');
}


