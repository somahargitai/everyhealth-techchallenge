# Every Health Tech Challenge - Implementation Plan

## 1. Project Setup

- Initialize a new Node.js project with TypeScript
- Set up project structure:

  ```bash
  src/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── services/
    ├── types/
    ├── utils/
    └── app.ts
  ```

- Configure TypeScript and ESLint
- Set up development environment with hot-reload
- Create initial README.md with setup instructions

## 2. Data Model & Database Setup

- Define TypeScript interfaces for Log data
- Set up SQLite database with TypeORM
- Create Log entity with fields:
  - timestamp
  - source
  - severity
  - message
  - patient_id (to be anonymized)
- Create database service layer

## 3. API Implementation

### 3.1 Base Setup

- Set up Express/Fastify application
- Implement basic error handling middleware
- Create health check endpoint

### 3.2 Log Endpoints

- Implement POST /logs endpoint for log ingestion
  - Add input validation
  - Implement data sanitization
  - Add error handling
- Implement GET /logs endpoint
  - Add filtering by severity
  - Add timestamp filtering
  - Implement pagination
- Implement GET /stats endpoint
  - Calculate severity level counts
  - Add basic statistics

## 4. Data Security & Validation

- Implement data validation middleware
- Create sanitization utility for sensitive fields
- Add request rate limiting
- Implement basic security headers
- Add input validation using a schema validator (e.g., Zod)

## 5. Testing

- Set up testing environment (Jest)
- Write unit tests for:
  - Data validation
  - Database operations
  - API endpoints
- Add integration tests for main flows

## 6. Documentation & Polish

- Complete API documentation
- Add example requests/responses
- Update README with:
  - Setup instructions
  - API documentation
  - Development guidelines
- Add logging for debugging
- Implement proper error messages

## 7. Bonus Features (if time permits)

- Implement data anonymization for patient_id
- Add request validation middleware
- Implement caching layer
- Add more sophisticated filtering options
- Implement basic monitoring

## 8. Design Reflection Document

Create a separate document addressing:

1. Design choices and trade-offs
2. Production considerations
3. AWS deployment strategy
4. Future expansion plans
