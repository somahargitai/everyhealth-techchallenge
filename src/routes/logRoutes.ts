import { Router } from 'express';
import { LogController } from '../controllers/LogController';
import { validateLog, validateLogQuery } from '../middleware/validation';

const router = Router();
const logController = new LogController();

/**
 * @swagger
 * /logs:
 *   post:
 *     summary: Create a new log entry
 *     tags: [Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Log'
 *           example:
 *             source: "test-service"
 *             severity: "info"
 *             message: "Test log message"
 *             patient_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *             metadata:
 *               additionalProp1: {}
 *     responses:
 *       201:
 *         description: Log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Log'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateLog, logController.createLog.bind(logController));

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get logs with filtering and pagination
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filter by source
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [info, warning, error, critical]
 *         description: Filter by severity
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs created after this timestamp
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs created before this timestamp
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Log'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', validateLogQuery, logController.getLogs.bind(logController));

/**
 * @swagger
 * /logs/stats:
 *   get:
 *     summary: Get log statistics
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter statistics for logs created after this timestamp
 *     responses:
 *       200:
 *         description: Log statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 severityCounts:
 *                   type: object
 *                   properties:
 *                     info:
 *                       type: integer
 *                     warning:
 *                       type: integer
 *                     error:
 *                       type: integer
 *                     critical:
 *                       type: integer
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', validateLogQuery, logController.getStats.bind(logController));

/**
 * @swagger
 * /logs/{id}:
 *   get:
 *     summary: Get a specific log entry
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Log ID
 *     responses:
 *       200:
 *         description: Log details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Log'
 *       404:
 *         description: Log not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', validateLogQuery, logController.getLogById.bind(logController));

export default router;
