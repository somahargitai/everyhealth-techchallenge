import { Request, Response } from 'express';
import { LogController } from '../../controllers/LogController';
import { LogService } from '../../services/LogService';
import { Log, LogSeverity } from '../../models/Log';

jest.mock('../../services/LogService');
jest.mock('../../config/logger');

describe('LogController', () => {
  let logController: LogController;
  let mockLogService: jest.Mocked<LogService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockLogService = new LogService() as jest.Mocked<LogService>;
    logController = new LogController();
    (logController as any).logService = mockLogService;

    mockRequest = {
      query: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('createLog', () => {
    it('should create a log successfully', async () => {
      const mockLog: Log = {
        id: '1',
        timestamp: new Date(),
        source: 'test-service',
        severity: 'info' as LogSeverity,
        message: 'Test log message',
        patient_id: '123'
      };

      mockRequest.body = {
        timestamp: mockLog.timestamp.toISOString(),
        source: mockLog.source,
        severity: mockLog.severity,
        message: mockLog.message,
        patient_id: mockLog.patient_id
      };

      mockLogService.create.mockResolvedValue(mockLog);

      await logController.createLog(mockRequest as Request, mockResponse as Response);

      expect(mockLogService.create).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockLog);
    });

    it('should handle errors when creating a log', async () => {
      const error = new Error('Database error');
      mockLogService.create.mockRejectedValue(error);

      await logController.createLog(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to create log',
        details: 'Database error'
      });
    });
  });

  describe('getLogs', () => {
    it('should get logs without filters', async () => {
      const mockLogs = {
        logs: [{
          id: '1',
          timestamp: new Date(),
          source: 'test-service',
          severity: 'info' as LogSeverity,
          message: 'Test log message',
          patient_id: '123'
        }],
        total: 1
      };

      mockLogService.findAll.mockResolvedValue(mockLogs);

      await logController.getLogs(mockRequest as Request, mockResponse as Response);

      expect(mockLogService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        ...mockLogs,
        page: 1,
        limit: 10
      });
    });

    it('should get logs with filters', async () => {
      const mockLogs = {
        logs: [{
          id: '1',
          timestamp: new Date(),
          source: 'test-service',
          severity: 'error' as LogSeverity,
          message: 'Test error message',
          patient_id: '123'
        }],
        total: 1
      };

      mockRequest.query = {
        severity: 'error',
        after: new Date().toISOString(),
        page: '1',
        limit: '10'
      };

      mockLogService.findAll.mockResolvedValue(mockLogs);

      await logController.getLogs(mockRequest as Request, mockResponse as Response);

      expect(mockLogService.findAll).toHaveBeenCalledWith({
        severity: 'error',
        after: expect.any(Date),
        page: 1,
        limit: 10
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        ...mockLogs,
        page: 1,
        limit: 10
      });
    });

    it('should handle errors when getting logs', async () => {
      const error = new Error('Database error');
      mockLogService.findAll.mockRejectedValue(error);

      await logController.getLogs(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to fetch logs',
        details: 'Database error'
      });
    });
  });

  describe('getStats', () => {
    it('should get log statistics successfully', async () => {
      const mockStats: Record<LogSeverity, number> = {
        info: 5,
        warning: 3,
        error: 2,
        critical: 0
      };

      mockLogService.getStats.mockResolvedValue(mockStats);

      await logController.getStats(mockRequest as Request, mockResponse as Response);

      expect(mockLogService.getStats).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockStats);
    });

    it('should handle errors when getting stats', async () => {
      const error = new Error('Database error');
      mockLogService.getStats.mockRejectedValue(error);

      await logController.getStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to fetch stats',
        details: 'Database error'
      });
    });
  });
}); 