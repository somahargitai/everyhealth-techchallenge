import 'reflect-metadata';
import express, { Request, Response } from 'express';
import { AppDataSource } from './config/database';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Database connection initialized');
  })
  .catch((error: Error) => {
    console.error('Error during database initialization:', error);
  });

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello World!' });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export { app }; 