import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('order_status_history')
@Index(['orderId', 'createdAt'])
export class OrderStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'varchar', nullable: true })
  fromStatus?: 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

  @Column({ type: 'varchar' })
  toStatus: 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

  @Column({ type: 'varchar' })
  actorType: 'system' | 'admin' | 'user';

  @Column({ type: 'uuid', nullable: true })
  actorId?: string;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;
}
