import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('add_to_cart_events')
@Index(['userId'])
@Index(['productId', 'variantId'])
export class AddToCartEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sessionId?: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid', nullable: true })
  variantId?: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;
}
