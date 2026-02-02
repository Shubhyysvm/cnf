import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  altText: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Category, (category) => category.children, { nullable: true })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('certifications')
export class Certification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  logoUrl: string;

  @Column({ type: 'varchar', nullable: true })
  verificationUrl: string;

  @ManyToMany(() => Product, (product) => product.certifications)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('products')
@Index(['slug'])
@Index(['category'])
@Index(['isBestSeller', 'createdAt'])
@Index(['isLatestArrival', 'createdAt'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  shortDescription: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  ingredients: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Base price for first variant

  @Column({ type: 'int', default: 0 })
  soldCount: number;

  @Column({ type: 'json', nullable: true })
  badges: string[];

  @Column({ type: 'varchar', nullable: true })
  sku: string;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'boolean', default: false })
  isBestSeller: boolean; // Shows in Best Sellers section

  @Column({ type: 'boolean', default: false })
  isLatestArrival: boolean; // Shows in Latest Arrivals section

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'float', default: 0 })
  rating: number; // Overall product rating (average of variant ratings)

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @Column({ type: 'varchar', nullable: true })
  categoryName: string; // Denormalized for easy access

  @ManyToMany(() => Certification, (certification) => certification.products)
  @JoinTable()
  certifications: Certification[];

  @OneToMany(() => ProductImage, (image) => image.product, { eager: true, cascade: true })
  images: ProductImage[];

  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true })
  variants: ProductVariant[];

  @OneToMany(() => ProductView, (view) => view.product)
  views: ProductView[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('product_images')
@Index(['product'])
@Index(['variantId', 'imageType'])
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string; // Denormalized from product

  @Column({ type: 'uuid', nullable: true })
  variantId: string; // Link to ProductVariant

  @Column({ type: 'varchar' })
  productName: string; // Denormalized for clarity

  @Column({ type: 'varchar', nullable: true })
  categoryName: string; // Denormalized for easy access

  @Column({ type: 'varchar', nullable: true })
  variantWeight: string; // Denormalized (e.g., "500ml", "1kg")

  @Column({ type: 'varchar', default: 'other' })
  imageType: 'hero-card' | 'info-card' | 'other'; // Image categorization

  @Column({ type: 'text' })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  altText: string; // Alt text for accessibility & SEO

  @Column({ type: 'varchar', nullable: true })
  fileName: string; // Object key for reference (e.g., "products/{id}/{weight}/hero-card/{filename}")

  @ManyToOne(() => Product, (product) => product.images, { onDelete: 'CASCADE' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('product_variants')
@Index(['product'])
@Index(['sku'])
@Index(['product', 'isActive'])
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  weight: string; // e.g., "500ml", "1kg", "100g" (renamed from 'name' for clarity)

  @Column({ type: 'uuid', nullable: true })
  categoryId: string; // Denormalized from product

  @Column({ type: 'varchar' })
  productName: string; // Denormalized for clarity

  @Column({ type: 'varchar', nullable: true })
  categoryName: string; // Denormalized for easy access

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountPrice: number | null; // Original price before discount (renamed from compareAtPrice)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discount: number; // Discount percentage (0-100)

  @Column({ type: 'varchar', nullable: true })
  sku: string;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'int', default: 0 })
  lowStockThreshold: number; // Threshold to mark as "low stock"

  @Column({ type: 'varchar', nullable: true })
  shelfLife: string; // e.g., "180 DAYS", "12 MONTHS"

  @Column({ type: 'float', default: 0 })
  rating: number; // Variant-specific rating

  @Column({ type: 'int', default: 0 })
  reviewCount: number; // Variant-specific reviews

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean; // If true, this is the default variant displayed on homepage and product cards

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  product: Product;

  @OneToMany(() => ProductView, (view) => view.variant, { nullable: true })
  views: ProductView[];

  @OneToMany(() => StockNotification, (notif) => notif.variant, { cascade: true })
  stockNotifications: StockNotification[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('product_views')
@Index(['product', 'viewedAt'])
@Index(['variant', 'viewedAt'])
@Index(['userId', 'viewedAt'])
export class ProductView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string; // Anonymous if null; user if authenticated

  @Column({ type: 'varchar', nullable: true })
  sessionId: string; // For anonymous users; can use browser fingerprint

  @Column({ type: 'timestamp' })
  viewedAt: Date;

  @Column({ type: 'uuid' })
  productId: string; // Denormalized

  @Column({ type: 'uuid', nullable: true })
  categoryId: string; // Denormalized for analytics

  @Column({ type: 'varchar' })
  productName: string; // Denormalized for analytics

  @Column({ type: 'varchar', nullable: true })
  categoryName: string; // Denormalized for analytics

  @Column({ type: 'uuid', nullable: true })
  variantId: string; // Explicit variant reference

  @Column({ type: 'varchar', nullable: true })
  variantWeight: string; // Denormalized

  @ManyToOne(() => Product, (product) => product.views, { onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => ProductVariant, (variant) => variant.views, { onDelete: 'CASCADE', nullable: true })
  variant: ProductVariant | null;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('stock_notifications')
@Index(['variant', 'userEmail'])
@Index(['notifiedAt'])
export class StockNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string; // If user is logged in

  @Column({ type: 'varchar' })
  userEmail: string; // Email to notify

  @Column({ type: 'varchar', nullable: true })
  userName: string;

  @Column({ type: 'boolean', default: false })
  isNotified: boolean; // Whether admin has been notified

  @Column({ type: 'timestamp', nullable: true })
  notifiedAt: Date; // When notification was sent to admin

  @Column({ type: 'uuid' })
  variantId: string; // Explicit variant reference

  @Column({ type: 'uuid' })
  productId: string; // Denormalized

  @Column({ type: 'varchar' })
  productName: string; // Denormalized for notification context

  @Column({ type: 'varchar', nullable: true })
  variantWeight: string; // Denormalized

  @ManyToOne(() => ProductVariant, (variant) => variant.stockNotifications, { onDelete: 'CASCADE' })
  variant: ProductVariant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
