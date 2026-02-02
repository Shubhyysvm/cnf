import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
@Index(['adminId', 'createdAt'])
@Index(['action', 'createdAt'])
@Index(['resourceType', 'resourceId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  adminId: string;

  @Column('varchar', { length: 100 })
  action: string;

  @Column('varchar', { length: 100 })
  resourceType: string;

  @Column('uuid', { nullable: true })
  resourceId?: string;

  @Column('jsonb', { nullable: true })
  changes?: Record<string, any>;

  @Column('varchar', { length: 50, nullable: true })
  ipAddress?: string;

  @Column('text', { nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  createdAt: Date;
}
