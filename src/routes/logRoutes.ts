import { Router } from 'express';
import { LogController } from '../controllers/LogController';
import { validateLog, validateLogQuery } from '../middleware/validation';

const router = Router();
const logController = new LogController();

// POST /logs - Create a new log
router.post('/', validateLog, logController.createLog.bind(logController));

// GET /logs - Get logs with filtering and pagination
router.get('/', validateLogQuery, logController.getLogs.bind(logController));

// GET /logs/:id - Get a specific log entry
router.get('/:id', logController.getLogById.bind(logController));

// GET /logs/stats - Get log statistics
router.get('/stats', logController.getStats.bind(logController));

export default router; 