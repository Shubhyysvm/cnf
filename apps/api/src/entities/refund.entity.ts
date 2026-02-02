import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('refunds')
@Index(['paymentId'])
@Index(['status', 'processedAt'])
export class Refund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  paymentId: string;

  @Column({ type: 'numeric' })
  amount: number;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'varchar' })
  status: 'initiated' | 'processing' | 'success' | 'failed';

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;
}
