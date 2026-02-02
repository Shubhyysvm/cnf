import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('order_coupons')
@Index(['orderId', 'couponId'], { unique: true })
export class OrderCoupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'uuid' })
  couponId: string;

  @Column({ type: 'varchar', length: 40 })
  code: string;

  @Column({ type: 'numeric' })
  discountApplied: number;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;
}
