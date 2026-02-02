import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('inventory_reservations')
@Index(['variantId', 'status'])
@Index(['cartId'])
@Index(['orderId'])
export class InventoryReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  variantId: string;

  @Column({ type: 'uuid', nullable: true })
  cartId?: string;

  @Column({ type: 'uuid', nullable: true })
  orderId?: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar' })
  status: 'active' | 'expired' | 'converted' | 'released';

  @Column({ type: 'timestamp', default: () => 'now()' })
  reservedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  releasedAt?: Date;
}
