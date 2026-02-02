import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('inventory_movements')
@Index(['variantId', 'createdAt'])
@Index(['reason'])
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  variantId: string;

  @Column({ type: 'int' })
  quantityChange: number;

  @Column({ type: 'varchar' })
  reason: 'order' | 'cancel' | 'return' | 'admin_adjustment';

  @Column({ type: 'varchar', nullable: true })
  referenceType?: 'order' | 'order_item' | 'return' | 'manual';

  @Column({ type: 'uuid', nullable: true })
  referenceId?: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdByAdminId?: string;
}
