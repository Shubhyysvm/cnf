import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('returns')
@Index(['orderItemId', 'status'])
export class ReturnEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderItemId: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'varchar' })
  status: 'initiated' | 'approved' | 'rejected' | 'received' | 'refunded';

  @Column({ type: 'numeric', nullable: true })
  refundAmount?: number;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;
}
