import { Request, Response } from 'express';
import { LogService } from '../services/LogService';
import { Log, LogSeverity } from '../models/Log';
import { logger } from '../config/logger';

export class LogController {
  private logService: LogService;

  constructor() {
    this.logService = new LogService();
  }

  async createLog(req: Request, res: Response): Promise<void> {
    try {
      const log = await this.logService.create(req.body);
      res.status(201).json(log);
    } catch (error) {
      logger.error('Failed to create log:', { error });
      res.status(400).json({
        status: 'error',
        message: 'Failed to create log',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '10', severity, source, after } = req.query;
      
      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        severity: severity as LogSeverity,
        source: source as string,
        after: after ? new Date(after as string) : undefined
      };

      const result = await this.logService.findAll(options);
      res.json({
        ...result,
        page: options.page,
        limit: options.limit
      });
    } catch (error) {
      logger.error('Failed to fetch logs:', { error });
      res.status(400).json({
        status: 'error',
        message: 'Failed to fetch logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.logService.getStats();
      res.json(stats);
    } catch (error) {
      logger.error('Failed to fetch stats:', { error });
      res.status(400).json({
        status: 'error',
        message: 'Failed to fetch stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  public async getLogById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const log = await this.logService.findById(id);

      if (!log) {
        res.status(404).json({
          status: 'error',
          message: 'Log not found'
        });
        return;
      }

      res.json(log);
    } catch (error: any) {
      logger.error('Failed to fetch log:', { error: error.message });
      res.status(400).json({
        status: 'error',
        message: 'Failed to fetch log',
        details: error.message
      });
    }
  }
} 