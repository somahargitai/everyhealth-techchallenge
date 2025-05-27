 <img src="./images/everyhealth-logo.png" alt="Every Health Logo" width="40"/>

# Every Health Tech Challenge
  
A log management system for Every Health's digital clinic.

Documents:

- [Design Reflection Document](./DesignReflectionDocument.md) - Design choices, production considerations, and future plans

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- SQLite3

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Server
PORT=3000

# Database
DB_PATH=./data/logs.db

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # 100 requests per window
```

### 3. Development mode

```bash
npm run dev
```

### 4. Build and run

```bash
npm run build
npm start
```

## API Endpoints

- `POST /logs` - Create a new log entry
- `GET /logs` - List logs with filtering and pagination
  - Query params: page, limit, severity, after, source
- `GET /logs/:id` - Get a specific log entry
- `GET /logs/stats` - Get log statistics
  - Query params: after

For detailed API documentation with examples, visit the Swagger UI at:
```bash
http://localhost:3000/api-docs
```

## Development Guidelines

### Code Formatting

The project uses Prettier for code formatting. To format your code:

```bash
# Format all files
npm run format

# Check if files are formatted correctly
npm run format:check
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage
```

## Project Structure

```bash
src/
  ├── __tests__/           # Test files
  │   ├── controllers/     # Controller tests
  │   ├── middleware/      # Middleware tests
  │   ├── utils/          # Utility tests
  │   └── log.test.ts     # API integration tests
  │
  ├── config/             # Configuration files
  │   ├── database.ts     # Database configuration
  │   ├── logger.ts       # Logging configuration
  │   └── swagger.ts      # API documentation
  │
  ├── controllers/        # Route controllers
  │   └── LogController.ts
  │
  ├── middleware/         # Express middleware
  │   └── validation.ts   # Request validation
  │
  ├── models/            # Data models
  │   └── Log.ts         # Log entity
  │
  ├── routes/            # API routes
  │   └── logRoutes.ts   # Log endpoints
  │
  ├── services/          # Business logic
  │   └── LogService.ts  # Log operations
  │
  ├── utils/             # Utility functions
  │   └── anonymization.ts # Patient ID anonymization
  │
  ├── app.ts             # Application entry point
  └── server.ts          # Server configuration
```
