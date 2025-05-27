import { Express } from 'express';
import request from 'supertest';

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