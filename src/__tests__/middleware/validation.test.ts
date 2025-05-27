import { Request, Response, NextFunction } from 'express';
import { validateLog, validateLogQuery } from '../../middleware/validation';
import { Log, LogSeverity } from '../../models/Log';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('validateLog', () => {
    it('should pass validation for valid log data', async () => {
      mockRequest.body = {
        timestamp: new Date().toISOString(),
        source: 'test-service',
        severity: LogSeverity.INFO,
        message: 'Test log message',
      };

      await validateLog(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should fail validation for invalid log data', async () => {
      mockRequest.body = {
        timestamp: 'invalid-date',
        source: '',
        severity: 'invalid-severity',
        message: '',
      };

      await validateLog(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Validation failed',
        })
      );
    });
  });

  describe('validateLogQuery', () => {
    it('should pass validation when no query parameters are provided', () => {
      mockRequest.query = {};

      validateLogQuery(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass validation for valid query parameters', () => {
      mockRequest.query = {
        page: '1',
        limit: '10',
        severity: LogSeverity.ERROR,
        after: new Date().toISOString(),
      };

      validateLogQuery(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should fail validation for invalid page number', () => {
      mockRequest.query = {
        page: 'invalid',
      };

      validateLogQuery(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Invalid query parameters',
          errors: ['Page must be a positive number'],
        })
      );
    });

    it('should fail validation for invalid severity level', () => {
      mockRequest.query = {
        severity: 'invalid-severity',
      };

      validateLogQuery(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Invalid query parameters',
          errors: ['Invalid severity level'],
        })
      );
    });

    it('should fail validation for invalid date format', () => {
      mockRequest.query = {
        after: 'invalid-date',
      };

      validateLogQuery(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Invalid query parameters',
          errors: ["Invalid date format for 'after' parameter"],
        })
      );
    });

    it('should fail validation for multiple invalid parameters', () => {
      mockRequest.query = {
        page: 'invalid',
        severity: 'invalid-severity',
        after: 'invalid-date',
      };

      validateLogQuery(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Invalid query parameters',
          errors: expect.arrayContaining([
            'Page must be a positive number',
            "Invalid date format for 'after' parameter",
            'Invalid severity level',
          ]),
        })
      );
    });
  });
});
