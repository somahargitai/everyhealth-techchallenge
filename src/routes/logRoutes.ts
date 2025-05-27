import { Router } from 'express';
import { LogController } from '../controllers/LogController';

const router = Router();
const logController = new LogController();

// POST /logs - Create a new log
router.post('/', logController.createLog.bind(logController));

// GET /logs - Get logs with filtering and pagination
router.get('/', logController.getLogs.bind(logController));

// GET /logs/stats - Get log statistics
router.get('/stats', logController.getStats.bind(logController));

export default router; 