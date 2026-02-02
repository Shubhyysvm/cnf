import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('checkout_abandonments')
@Index(['createdAt'])
@Index(['cartId'])
@Index(['userId'])
export class CheckoutAbandonment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  cartId: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  abandonedAt?: Date;

  @Column({ type: 'varchar' })
  step: 'address' | 'shipping' | 'payment' | 'review';

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;
}
