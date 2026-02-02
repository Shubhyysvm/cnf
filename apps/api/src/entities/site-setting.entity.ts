import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'site_settings' })
export class SiteSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  key: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  value: string | null;
}
