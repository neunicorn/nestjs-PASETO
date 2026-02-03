// import { join } from 'path';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity{.ts,.js}'], // Ensure this points to where your Auth entity lives
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false, // for development mode only
  logging: process.env.NODE_ENV === 'development',
});
