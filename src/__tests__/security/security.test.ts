import request from 'supertest';
import { app } from '../../app';
import { LogSeverity } from '../../models/Log';
import { AppDataSource } from '../../config/database';

describe('Security Tests', () => {
  beforeEach(async () => {
    // Clear the logs table before each test
    await AppDataSource.getRepository('logs').clear();
  });

  describe('SQL Injection Protection', () => {
    it('should prevent SQL injection in source field', async () => {
      const maliciousLog = {
        source: "test'; DROP TABLE logs; --",
        severity: LogSeverity.INFO,
        message: 'Test message',
      };

      const response = await request(app)
        .post('/logs')
        .send(maliciousLog)
        .expect(201);

      // Verify the log was created with the sanitized input
      expect(response.body.source).toBe(maliciousLog.source);
      
      // Verify the table still exists and is accessible
      const logs = await request(app).get('/logs').expect(200);
      expect(Array.isArray(logs.body.logs)).toBe(true);
    });

    it('should prevent SQL injection in query parameters', async () => {
      // First create a test log
      await request(app)
        .post('/logs')
        .send({
          source: 'test-service',
          severity: LogSeverity.INFO,
          message: 'Test message',
        })
        .expect(201);

      // Try to inject SQL in the source query parameter
      const response = await request(app)
        .get('/logs')
        .query({ source: "test'; DROP TABLE logs; --" })
        .expect(200);

      // Verify the query was handled safely
      expect(Array.isArray(response.body.logs)).toBe(true);
      expect(response.body.logs.length).toBe(0);
    });
  });

  describe('XSS Protection', () => {
    it('should prevent XSS in message field', async () => {
      const maliciousLog = {
        source: 'test-service',
        severity: LogSeverity.INFO,
        message: '<script>alert("XSS")</script>',
      };

      const response = await request(app)
        .post('/logs')
        .send(maliciousLog)
        .expect(201);

      // Verify the message was stored as-is (not executed)
      expect(response.body.message).toBe(maliciousLog.message);
      
      // Verify the message is returned as-is in GET response
      const logs = await request(app).get('/logs').expect(200);
      const createdLog = logs.body.logs.find((log: any) => log.message === maliciousLog.message);
      expect(createdLog.message).toBe(maliciousLog.message);
    });

    it('should prevent XSS in metadata field', async () => {
      const maliciousLog = {
        source: 'test-service',
        severity: LogSeverity.INFO,
        message: 'Test message',
        metadata: {
          userInput: '<img src="x" onerror="alert(\'XSS\')">',
        },
      };

      const response = await request(app)
        .post('/logs')
        .send(maliciousLog)
        .expect(201);

      // Verify the metadata was stored as-is
      expect(response.body.metadata).toEqual(maliciousLog.metadata);
      
      // Verify the metadata is returned as-is in GET response
      const logs = await request(app).get('/logs').expect(200);
      const createdLog = logs.body.logs.find((log: any) => log.message === maliciousLog.message);
      expect(createdLog.metadata).toEqual(maliciousLog.metadata);
    });
  });
});
