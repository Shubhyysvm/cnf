import { DataSource } from 'typeorm';
import { seedCNFDatabaseV2 } from './seed-cnf-v2';

export async function seedDatabase(dataSource: DataSource) {
  // Use the new v2 seeding function with enhanced schema
  await seedCNFDatabaseV2(dataSource);
}
