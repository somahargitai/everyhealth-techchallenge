import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Log, LogSeverity } from '../models/Log';

export const validateLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Remove timestamp from request body if provided by client
    if (req.body.timestamp) {
      delete req.body.timestamp;
    }

    const logDto = plainToInstance(Log, req.body);
    const errors = await validate(logDto);

    if (errors.length > 0) {
      const formattedErrors = errors.map((error: ValidationError) => ({
        property: error.property,
        constraints: error.constraints,
      }));

      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: formattedErrors,
      });
      return;
    }

    req.body = logDto;
    return next();
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: [{ message: 'Invalid request body' }],
    });
    return;
  }
};

export const validateLogQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, severity, after, before } = req.query;
    const errors: string[] = [];

    // Validate page
    if (page !== undefined) {
      const pageNum = parseInt(page as string);
      if (isNaN(pageNum) || pageNum < 1) {
        errors.push('Page must be a positive number');
      }
    }

    // Validate limit
    if (limit !== undefined) {
      const limitNum = parseInt(limit as string);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        errors.push('Limit must be a number between 1 and 100');
      }
    }

    // Validate after date
    if (after !== undefined) {
      const date = new Date(after as string);
      if (isNaN(date.getTime())) {
        errors.push("Invalid date format for 'after' parameter");
      }
    }

    // Validate before date
    if (before !== undefined) {
      const date = new Date(before as string);
      if (isNaN(date.getTime())) {
        errors.push("Invalid date format for 'before' parameter");
      }
    }

    // Validate date range
    if (after !== undefined && before !== undefined) {
      const afterDate = new Date(after as string);
      const beforeDate = new Date(before as string);
      if (afterDate > beforeDate) {
        errors.push("'after' date must be before 'before' date");
      }
    }

    // Validate severity
    if (severity !== undefined && !Object.values(LogSeverity).includes(severity as LogSeverity)) {
      errors.push('Invalid severity level');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid query parameters',
        errors,
      });
    }

    next();
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid query parameters',
      errors: [{ message: 'Invalid request query' }],
    });
  }
};
