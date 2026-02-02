import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('coupons')
@Index(['code'], { unique: true })
@Index(['validFrom', 'validTo'])
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 40 })
  code: string;

  @Column({ type: 'varchar' })
  type: 'flat' | 'percentage';

  @Column({ type: 'numeric' })
  value: number;

  @Column({ type: 'numeric', nullable: true })
  minOrderAmount?: number;

  @Column({ type: 'numeric', nullable: true })
  maxDiscount?: number;

  @Column({ type: 'timestamp', nullable: true })
  validFrom?: Date;

  @Column({ type: 'timestamp', nullable: true })
  validTo?: Date;

  @Column({ type: 'int', nullable: true })
  usageLimit?: number;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;
}
