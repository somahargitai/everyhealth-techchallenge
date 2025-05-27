import { DataSource } from 'typeorm';
import { Log } from '../models/Log';
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DB_PATH || 'logs.db',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'test' ? false : process.env.DB_LOGGING === 'true',
  entities: [Log],
  subscribers: [],
  extra: {
    // Add SQLite specific options to handle concurrent access
    busyTimeout: 5000, // Wait up to 5 seconds for the database to be available
    journalMode: 'WAL', // Use Write-Ahead Logging for better concurrency
  },
});
