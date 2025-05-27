import { Express } from 'express';
import request from 'supertest';
import { AppDataSource } from '../config/database';

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
      message: () =>
        `expected ${received} to be a valid log object with required fields`,
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
}); 