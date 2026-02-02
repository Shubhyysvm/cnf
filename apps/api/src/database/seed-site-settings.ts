import { DataSource } from 'typeorm';
import { SiteSetting } from '../entities/site-setting.entity';
import { config } from 'dotenv';
config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [SiteSetting],
  synchronize: false,
});

async function seedSiteSettings() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(SiteSetting);

  await repo.save([
    { key: 'freeShippingThreshold', value: '4000' },
    { key: 'shippingCost', value: '500' },
  ]);

  console.log('Site settings seeded');
  await AppDataSource.destroy();
}

seedSiteSettings();
