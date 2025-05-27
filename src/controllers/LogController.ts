import { Request, Response } from 'express';
import { LogService } from '../services/LogService';
import { Log, LogSeverity } from '../models/Log';

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
      res.status(400).json({ error: 'Failed to create log' });
    }
  }

  async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, severity, source, after } = req.query;
      const options = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        severity: severity as LogSeverity,
        source: source as string,
        after: after ? new Date(after as string) : undefined
      };

      const result = await this.logService.findAll(options);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: 'Failed to fetch logs' });
    }
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.logService.getStats();
      res.json(stats);
    } catch (error) {
      res.status(400).json({ error: 'Failed to fetch stats' });
    }
  }
} 