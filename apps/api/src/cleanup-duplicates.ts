import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Category, Certification, Product, ProductImage, ProductVariant, ProductView, StockNotification } from './entities/product.entity';
import { Admin } from './entities/admin.entity';
import { User } from './entities/user.entity';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { SiteSetting } from './entities/site-setting.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'countrynaturalfoods',
  password: process.env.POSTGRES_PASSWORD || 'countrynaturalfoods',
  database: process.env.POSTGRES_DB || 'countrynaturalfoods',
  entities: [
    Category,
    Certification,
    Product,
    ProductImage,
    ProductVariant,
    ProductView,
    StockNotification,
    Admin,
    User,
    Cart,
    CartItem,
    Order,
    OrderItem,
    SiteSetting,
  ],
  synchronize: false,
  logging: true,
});

async function cleanupDuplicates() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Find duplicates
    const duplicates = await AppDataSource.query(`
      SELECT LOWER(name) as name_lower, array_agg(id) as ids, COUNT(*) as cnt
      FROM products
      GROUP BY LOWER(name)
      HAVING COUNT(*) > 1
      ORDER BY cnt DESC;
    `);

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
    } else {
      console.log(`⚠️  Found ${duplicates.length} duplicate groups:`);
      
      for (const duplicate of duplicates) {
        console.log(`\n  Product: ${duplicate.name_lower}`);
        console.log(`  Count: ${duplicate.cnt}`);
        console.log(`  IDs: ${duplicate.ids.join(', ')}`);

        const idsToDelete = duplicate.ids.slice(1); // Keep first, delete rest
        
        if (idsToDelete.length > 0) {
          const deletedResult = await AppDataSource.query(
            `DELETE FROM products WHERE id = ANY($1)`,
            [idsToDelete]
          );
          console.log(`  ✅ Deleted ${idsToDelete.length} duplicate(s)`);
        }
      }
    }

    // Verify cleanup
    const finalCheck = await AppDataSource.query(`
      SELECT LOWER(name) as name_lower, COUNT(*) as cnt
      FROM products
      GROUP BY LOWER(name)
      HAVING COUNT(*) > 1;
    `);

    if (finalCheck.length === 0) {
      console.log('\n✅ Cleanup complete! All duplicates removed.');
    } else {
      console.log('\n⚠️  Warning: Some duplicates remain.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

cleanupDuplicates();
