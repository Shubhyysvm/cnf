import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER || 'countrynaturalfoods',
    password: process.env.POSTGRES_PASSWORD || 'countrynaturalfoods',
    database: process.env.POSTGRES_DB || 'countrynaturalfoods',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: false, // Disabled - use migrations instead
    logging: process.env.NODE_ENV === 'development',
  }),
);
