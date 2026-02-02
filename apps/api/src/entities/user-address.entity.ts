import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('user_addresses')
@Index(['userId', 'type'])
@Index(['userId'], { where: '"isDefault" = true' })
export class UserAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  type: 'home' | 'work' | 'other';

  @Column({ type: 'varchar', length: 50, nullable: true })
  customLabel?: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  recipientName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255 })
  line1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  line2?: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 50 })
  state: string;

  @Column({ type: 'varchar', length: 20 })
  zip: string;

  @Column({ type: 'varchar', length: 100, default: 'United States' })
  country: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;
}
