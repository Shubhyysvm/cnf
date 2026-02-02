import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { ProductVariant } from './product.entity';

@Entity('wishlists')
@Index(['userId', 'productId', 'variantId'], { unique: true, where: '"userId" IS NOT NULL' })
@Index(['sessionId', 'productId', 'variantId'], { unique: true, where: '"sessionId" IS NOT NULL' })
@Index(['sessionId'])
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null; // null for guest wishlists

  @Column({ type: 'varchar', length: 100, nullable: true })
  sessionId: string | null; // For guest wishlist identification

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid', nullable: true })
  variantId: string | null;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => ProductVariant, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null; // Hero image URL at time of adding to wishlist

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null; // For cleaning up old guest wishlists (7 days)
}
