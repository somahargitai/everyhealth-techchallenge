import { Express } from 'express';
import request from 'supertest';
import { AppDataSource } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

// Extend the global Jest namespace
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidLog(): R;
    }
  }
}

// Add custom matchers
expect.extend({
  toBeValidLog(received) {
    const hasRequiredFields =
      'timestamp' in received &&
      'source' in received &&
      'severity' in received &&
      'message' in received;

    return {
      message: () => `expected ${received} to be a valid log object with required fields`,
      pass: hasRequiredFields,
    };
  },
});

// Setup before all tests
beforeAll(async () => {
  // Initialize the database connection
  await AppDataSource.initialize();

  // Ensure database is synchronized
  await AppDataSource.synchronize(true);
});

// Cleanup after all tests
afterAll(async () => {
  // Close the database connection
  await AppDataSource.destroy();

  // Clean up test database files
  const testDbFiles = fs
    .readdirSync(process.cwd())
    .filter(file => file.startsWith('test-') && file.endsWith('.db'));

  for (const file of testDbFiles) {
    try {
      fs.unlinkSync(path.join(process.cwd(), file));
    } catch (error) {
      console.error(`Error deleting test database file ${file}:`, error);
    }
  }
});
