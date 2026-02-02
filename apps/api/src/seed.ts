import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { seedDatabase } from './database/seed';

async function runSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Seeding database...');
  await seedDatabase(dataSource);

  await app.close();
  process.exit(0);
}

runSeed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
