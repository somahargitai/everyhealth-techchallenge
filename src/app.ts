import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import { AppDataSource } from './config/database';
import { logger, morganMiddleware } from './config/logger';
import logRoutes from './routes/logRoutes';
import cors from 'cors';
import { swaggerSpec } from './config/swagger';
import swaggerUi from 'swagger-ui-express';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morganMiddleware);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/logs', logRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: AppDataSource.isInitialized ? 'connected' : 'disconnected',
  });
});

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello World!' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', { error: err.message, stack: err.stack });
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

// Initialize database and start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  AppDataSource.initialize()
    .then(() => {
      logger.info('Database connection initialized');
      app.listen(port, () => {
        logger.info(`Server is running on port ${port}`);
        logger.info(`API documentation available at http://localhost:${port}/api-docs`);
      });
    })
    .catch(error => {
      logger.error('Error during database initialization:', { error: error.message });
      process.exit(1);
    });
}

export { app };
