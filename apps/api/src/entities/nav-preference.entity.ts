import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'nav_preferences' })
export class NavPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('simple-array', { default: 'home,shop,categories,cart,orders,wishlist,profile,about,contact' })
  menuOrder: string[];

  @Column('simple-array', { default: '' })
  hiddenItems: string[];

  @Column('simple-array', { default: '' })
  favoriteItems: string[];

  @Column({ type: 'boolean', default: false })
  compactMode: boolean;

  @Column({ type: 'varchar', default: 'light' })
  theme: 'light' | 'dark';

  @Column({ type: 'boolean', default: true })
  enableAnimations: boolean;

  @Column({ type: 'boolean', default: true })
  enableBadges: boolean;

  @Column({ type: 'boolean', default: true })
  enableNotifications: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
