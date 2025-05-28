import request from 'supertest';
import { app } from '../app';
import { LogSeverity } from '../models/Log';
import { AppDataSource } from '../config/database';

describe('Log Endpoints', () => {
  beforeEach(async () => {
    // Clear the logs table before each test
    await AppDataSource.getRepository('logs').clear();
  });

  describe('POST /logs', () => {
    it('should create a new log entry', async () => {
      const logData = {
        source: 'test-service',
        severity: 'info',
        message: 'Test log message',
        metadata: { test: true },
      };

      const response = await request(app).post('/logs').send(logData).expect(201);

      expect(response.body).toBeValidLog();
      expect(response.body.source).toBe(logData.source);
      expect(response.body.severity).toBe(logData.severity);
      expect(response.body.message).toBe(logData.message);
    });

    it('should create a log with patient_id', async () => {
      const logData = {
        source: 'test-service',
        severity: 'info',
        message: 'Test log message',
        patient_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      };

      const response = await request(app).post('/logs').send(logData).expect(201);

      expect(response.body).toBeValidLog();
      expect(response.body.patient_id).toMatch(/^anon_[a-f0-9]{16}$/);
    });

    it('should return 400 for invalid log data', async () => {
      const invalidLogData = {
        source: 'test-service',
        // Missing required fields
      };

      await request(app).post('/logs').send(invalidLogData).expect(400);
    });

    it('should return 400 for invalid severity', async () => {
      const invalidLogData = {
        source: 'test-service',
        severity: 'invalid-severity',
        message: 'Test message',
      };

      await request(app).post('/logs').send(invalidLogData).expect(400);
    });

    it('should return 400 for invalid patient_id format', async () => {
      const invalidLogData = {
        source: 'test-service',
        severity: 'info',
        message: 'Test message',
        patient_id: 'invalid-uuid',
      };

      await request(app).post('/logs').send(invalidLogData).expect(400);
    });
  });

  describe('GET /logs', () => {
    beforeEach(async () => {
      // Create test logs with different severities and timestamps
      const logs = [
        {
          source: 'test-service',
          severity: LogSeverity.INFO,
          message: 'Info message',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        },
        {
          source: 'test-service',
          severity: LogSeverity.ERROR,
          message: 'Error message',
          timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        },
        {
          source: 'other-service',
          severity: LogSeverity.WARNING,
          message: 'Warning message',
          timestamp: new Date(), // now
        },
      ];

      for (const log of logs) {
        await request(app).post('/logs').send(log);
      }
    });

    it('should return paginated logs', async () => {
      const response = await request(app).get('/logs').query({ page: 1, limit: 10 }).expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(Array.isArray(response.body.logs)).toBe(true);
    });

    it('should filter logs by severity', async () => {
      const response = await request(app)
        .get('/logs')
        .query({ severity: LogSeverity.ERROR })
        .expect(200);

      expect(response.body.logs.every((log: any) => log.severity === LogSeverity.ERROR)).toBe(true);
    });

    it('should filter logs by source', async () => {
      const response = await request(app)
        .get('/logs')
        .query({ source: 'test-service' })
        .expect(200);

      expect(response.body.logs.every((log: any) => log.source === 'test-service')).toBe(true);
    });

    it('should filter logs by after timestamp', async () => {
      const after = new Date(Date.now() - 2000000); // 33 minutes ago
      const response = await request(app)
        .get('/logs')
        .query({ after: after.toISOString() })
        .expect(200);

      expect(response.body.logs.every((log: any) => new Date(log.timestamp) > after)).toBe(true);
    });

    it('should filter logs by before timestamp', async () => {
      const before = new Date(Date.now() - 900000); // 15 minutes ago
      const response = await request(app)
        .get('/logs')
        .query({ before: before.toISOString() })
        .expect(200);

      expect(response.body.logs.every((log: any) => new Date(log.timestamp) < before)).toBe(true);
    });

    it('should handle invalid after timestamp', async () => {
      await request(app).get('/logs').query({ after: 'invalid-date' }).expect(400);
    });

    it('should handle invalid before timestamp', async () => {
      await request(app).get('/logs').query({ before: 'invalid-date' }).expect(400);
    });

    it('should handle after date being later than before date', async () => {
      const after = new Date(Date.now() - 900000); // 15 minutes ago
      const before = new Date(Date.now() - 1800000); // 30 minutes ago

      await request(app)
        .get('/logs')
        .query({ after: after.toISOString(), before: before.toISOString() })
        .expect(400);
    });

    it('should handle multiple filters including before', async () => {
      const before = new Date(Date.now() - 900000); // 15 minutes ago
      const response = await request(app)
        .get('/logs')
        .query({
          source: 'test-service',
          severity: LogSeverity.INFO,
          before: before.toISOString(),
          page: 1,
          limit: 10,
        })
        .expect(200);

      expect(
        response.body.logs.every(
          (log: any) =>
            log.source === 'test-service' &&
            log.severity === LogSeverity.INFO &&
            new Date(log.timestamp) < before
        )
      ).toBe(true);
    });

    it('should handle invalid page number', async () => {
      await request(app).get('/logs').query({ page: 'invalid' }).expect(400);
    });

    it('should handle invalid limit', async () => {
      await request(app).get('/logs').query({ limit: 'invalid' }).expect(400);
    });

    it('should handle negative page number', async () => {
      await request(app).get('/logs').query({ page: -1 }).expect(400);
    });

    it('should handle zero limit', async () => {
      await request(app).get('/logs').query({ limit: 0 }).expect(400);
    });

    it('should handle limit exceeding maximum', async () => {
      await request(app).get('/logs').query({ limit: 101 }).expect(400);
    });

    it('should handle multiple filters', async () => {
      const after = new Date(Date.now() - 2000000);
      const response = await request(app)
        .get('/logs')
        .query({
          source: 'test-service',
          severity: LogSeverity.INFO,
          after: after.toISOString(),
          page: 1,
          limit: 10,
        })
        .expect(200);

      expect(
        response.body.logs.every(
          (log: any) =>
            log.source === 'test-service' &&
            log.severity === LogSeverity.INFO &&
            new Date(log.timestamp) > after
        )
      ).toBe(true);
    });

    it('should handle pagination with multiple pages', async () => {
      // Clear the database first to ensure we start with a clean state
      await AppDataSource.getRepository('logs').clear();

      // Create 50 test logs
      const totalLogs = 50;
      const logsPerPage = 10;
      const targetPage = 5;

      // Generate and insert logs
      for (let i = 0; i < totalLogs; i++) {
        const logData = {
          source: 'pagination-test',
          severity: LogSeverity.INFO,
          message: `Test log message ${i + 1}`,
          timestamp: new Date(Date.now() - i * 60000), // Each log 1 minute apart
        };
        await request(app).post('/logs').send(logData);
      }

      // Test page 5
      const response = await request(app)
        .get('/logs')
        .query({ 
          page: targetPage, 
          limit: logsPerPage,
          source: 'pagination-test' // Add source filter to ensure we only get our test logs
        })
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('logs');
      expect(response.body.total).toBe(totalLogs);
      expect(response.body.page).toBe(targetPage);
      expect(response.body.limit).toBe(logsPerPage);
      expect(Array.isArray(response.body.logs)).toBe(true);
      expect(response.body.logs.length).toBe(logsPerPage);

      // Verify we're getting the correct page of results
      // Page 5 should contain logs 41-50 (0-based index)
      const expectedStartIndex = (targetPage - 1) * logsPerPage;
      const expectedEndIndex = targetPage * logsPerPage;

      response.body.logs.forEach((log: any, index: number) => {
        const expectedMessageNumber = expectedStartIndex + index + 1;
        expect(log.message).toBe(`Test log message ${expectedMessageNumber}`);
        expect(log.source).toBe('pagination-test');
        expect(log.severity).toBe(LogSeverity.INFO);
      });

      // Test that we can't access a page beyond the available data
      const beyondLastPage = Math.ceil(totalLogs / logsPerPage) + 1;
      const emptyPageResponse = await request(app)
        .get('/logs')
        .query({ 
          page: beyondLastPage, 
          limit: logsPerPage,
          source: 'pagination-test' // Add source filter here too
        })
        .expect(200);

      expect(emptyPageResponse.body.logs).toHaveLength(0);
      expect(emptyPageResponse.body.total).toBe(totalLogs);
    });
  });

  describe('GET /logs/:id', () => {
    it('should return a specific log entry', async () => {
      // First create a log
      const logData = {
        source: 'test-service',
        severity: 'info',
        message: 'Test log message',
      };

      const createResponse = await request(app).post('/logs').send(logData).expect(201);

      const logId = createResponse.body.id;

      // Then fetch it
      const response = await request(app).get(`/logs/${logId}`).expect(200);

      expect(response.body).toBeValidLog();
      expect(response.body.id).toBe(logId);
    });

    it('should return 404 for non-existent log', async () => {
      await request(app).get('/logs/non-existent-id').expect(404);
    });

    it('should return 404 for non-UUID format', async () => {
      await request(app).get('/logs/invalid-uuid').expect(404);
    });

    it('should return 400 for invalid UUID format', async () => {
      await request(app).get('/logs/12345678-1234-1234-1234-123456789abc').expect(400);
    });
  });

  describe('GET /logs/stats', () => {
    beforeEach(async () => {
      // Create test logs with different severities
      const logs = [
        { source: 'test-service', severity: LogSeverity.INFO, message: 'Info 1' },
        { source: 'test-service', severity: LogSeverity.INFO, message: 'Info 2' },
        { source: 'test-service', severity: LogSeverity.ERROR, message: 'Error 1' },
        { source: 'test-service', severity: LogSeverity.WARNING, message: 'Warning 1' },
      ];

      for (const log of logs) {
        await request(app).post('/logs').send(log);
      }
    });

    it('should return correct severity counts', async () => {
      const response = await request(app).get('/logs/stats').expect(200);

      expect(response.body).toHaveProperty('total', 4);
      expect(response.body.severityCounts).toEqual({
        info: 2,
        warning: 1,
        error: 1,
        critical: 0,
      });
    });

    it('should filter stats by after timestamp', async () => {
      const after = new Date(Date.now() - 1000); // 1 second ago
      const response = await request(app)
        .get('/logs/stats')
        .query({ after: after.toISOString() })
        .expect(200);

      expect(response.body.total).toBeGreaterThan(0);
    });

    it('should handle invalid after timestamp', async () => {
      await request(app).get('/logs/stats').query({ after: 'invalid-date' }).expect(400);
    });
  });
});
