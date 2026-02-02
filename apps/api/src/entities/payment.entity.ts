import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('payments')
@Index(['orderId'])
@Index(['provider', 'status'])
@Index(['createdAt'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'varchar' })
  provider: 'razorpay' | 'stripe' | 'cashfree' | 'cod';

  @Column({ type: 'varchar' })
  status: 'initiated' | 'success' | 'failed' | 'refunded';

  @Column({ type: 'numeric' })
  amount: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentIntentId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionId?: string;

  @Column({ type: 'jsonb', nullable: true })
  gatewayResponse?: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;
}
