# Every Health Tech Challenge

A log management system for Every Health's digital clinic.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Development mode

```bash
npm run dev
```

### 3. Build and run

```bash
npm run build
npm start
```

## API Endpoints

- `GET /` - Hello World endpoint

## Project Structure

```bash
src/
  ├── controllers/    # Route controllers
  ├── models/        # Data models
  ├── routes/        # API routes
  ├── services/      # Business logic
  ├── types/         # TypeScript types
  ├── utils/         # Utility functions
  └── app.ts         # Application entry point
```

## API Documentation

The API documentation is available through Swagger UI. When the server is running, you can access it at:

```bash
http://localhost:3000/api-docs
```

The Swagger UI provides:

- Interactive API documentation
- Detailed endpoint descriptions
- Request/response schemas
- Example requests and responses
- The ability to test endpoints directly from the browser

### Available Endpoints

The API documentation includes all available endpoints with their:

- HTTP methods
- Required parameters
- Request body schemas
- Response schemas
- Example values

You can test any endpoint directly from the Swagger UI by:

1. Clicking on the endpoint
2. Clicking "Try it out"
3. Filling in the required parameters
4. Clicking "Execute"
