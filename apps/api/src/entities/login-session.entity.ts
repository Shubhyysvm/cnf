import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('login_sessions')
@Index(['sessionId'], { unique: true })
@Index(['userId', 'createdAt'])
export class LoginSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 255 })
  sessionId: string;

  @Column({ type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt?: Date;

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean;
}
