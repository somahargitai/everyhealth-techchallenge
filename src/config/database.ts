import { DataSource } from 'typeorm';
import { Log } from '../models/Log';
import 'dotenv/config';

// Generate unique database file name for tests
const getDatabasePath = () => {
  if (process.env.NODE_ENV === 'test') {
    return `test-${Date.now()}.db`;
  }
  return process.env.DB_PATH || 'logs.db';
};

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: getDatabasePath(),
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'test' ? false : process.env.DB_LOGGING === 'true',
  entities: [Log],
  subscribers: [],
  extra: {
    // Add SQLite specific options to handle concurrent access
    busyTimeout: 20000, // Increase timeout to 20 seconds
    journalMode: 'WAL', // Use Write-Ahead Logging for better concurrency
    synchronous: 'NORMAL', // Less strict synchronization for better performance
    tempStore: 'MEMORY', // Store temporary tables and indices in memory
    cache: 'shared', // Enable shared cache mode
    lockingMode: 'NORMAL', // Use normal locking mode
  },
});
