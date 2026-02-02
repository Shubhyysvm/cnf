import { DataSource } from 'typeorm';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const migrationsPath = path.join(__dirname, 'migrations');
const entitiesPath = path.join(__dirname, '**', '*.entity.ts');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'countrynaturalfoods',
  password: process.env.POSTGRES_PASSWORD || 'countrynaturalfoods',
  database: process.env.POSTGRES_DB || 'countrynaturalfoods',
  entities: [entitiesPath],
  migrations: [migrationsPath + '/*.ts'],
  synchronize: false,
  logging: !isProduction,
});
