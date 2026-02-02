import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('search_logs')
@Index(['createdAt'])
@Index(['userId'])
export class SearchLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sessionId?: string;

  @Column({ type: 'text' })
  query: string;

  @Column({ type: 'int', nullable: true })
  resultCount?: number;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;
}
