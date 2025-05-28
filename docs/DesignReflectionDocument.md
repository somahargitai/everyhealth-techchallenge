 <img src="../images/everyhealth-considerations.svg" alt="Every Health Logo" width="300"/>

# Design Reflection Document

## 1. Design Choices and Trade-offs

### Database Choice

- **SQLite with TypeORM**:
  - Pros:
    - Simple setup, no external dependencies, good for development, Typescript native ORM
    - By Decorators and OOP it is easy to learn for developers with Java background
    - Entity structures are safe and standardized
  - Cons:
    - TypeORM is more opinionated and a bit harder to read. Sequelize may be considered as alternateive
    - Not optimal for high-concurrency production use, Prisma may be considered as alternative
    - Sqlite fails even on tests with minor concurrency situations. It is good enough and managable for a demonstration like this project, but in production code not acceptable
  - Trade-off: Chosen for simplicity and development speed

### API Design

- **REST API with Express**:
  - Pros:
    - Standard RESTful endpoints for CRUD operations
    - Express is very well documented
  - Cons:
    - Fastify's performance is a better on speed
    - Fastify provide better Typescript support.
    - Plugins not available for Express
  - Trade-off: Chose Express for its maturity and extensive community support despite Fastify's better performance and TypeScript features
  
### Additional Tools

- Swagger for documentation and manual testing
- Winston and Morgan are reliable for logging
- Prettier to enforce formatting conventions

### Security Measures

- **Patient ID Anonymization**:
  - Using SHA-256 for one-way hashing
  - Consistent hashing (same ID always hashes to same value)
  - Trade-off: Could have used more sophisticated anonymization, but current solution balances security and performance

### Data Validation

- **Class-validator + TypeORM**:
  - Runtime validation for API inputs
  - Type safety with TypeScript
  - Trade-off: Some duplication between TypeScript types and validation schemas

## 2. Production Considerations

### Privacy

- Patient ID anonymization before storage
- No sensitive data in logs
- Rate limiting to prevent abuse, DDoS Attacks
- CORS configuration for controlled access

### Scaling

Current limitations:

- SQLite not suitable for high concurrency
- No caching layer
- In-memory rate limiting

Production improvements needed:

- Migrate to PostgreSQL or similar
- Implement Redis for caching
- Add load balancing
- Implement proper connection pooling

### Monitoring

Current implementation:

- Basic logging with Winston
- Error tracking in responses

Production improvements needed:

- Add APM (Application Performance Monitoring), like Sentry or New Relic
- Set up alerting system
- Add metrics collection

## 3. AWS Deployment Strategy

### Infrastructure

1. **Compute**:
   - ECS (Elastic Container Service) for containerized deployment
   - Fargate for serverless container management
   - Auto-scaling based on load

2. **Database**:
   - RDS PostgreSQL for production database
   - Read replicas for scaling
   - Automated backups

3. **Caching**:
   - ElastiCache Redis for caching
   - Rate limiting
   - Session management

4. **Security**:
   - AWS WAF for web application firewall
   - AWS Shield for DDoS protection
   - AWS Secrets Manager for sensitive data
   - VPC with private subnets

5. **Monitoring**:
   - CloudWatch for logs and metrics
   - X-Ray for tracing
   - CloudTrail for audit logs

6. **CI/CD Pipeline**
   - Github Actions for CI
   - Automated testing

## 4. Future Expansion Plans

### User Authentication & Authorization

1. **Authentication**:
   - JWT-based authentication
   - OAuth2 integration
   - MFA support

2. **Role-Based Access Control (RBAC)**:
   - Role definitions
   - Permission management
   - Access control lists

### Audit Logging

1. **Enhanced Logging**:
   - User action tracking
   - Data access logs
   - Security event logging

2. **Compliance**:
   - HIPAA compliance features
   - Data retention policies
   - Audit trail requirements

### Feature Expansion

1. **API Enhancements**:
   - GraphQL support
   - WebSocket for real-time updates
   - Bulk operations

2. **Data Management**:
   - Data archival
   - Data export/import
   - Backup and restore

3. **Integration**:
   - Third-party service integration
   - Webhook support
   - API key management

### Performance Optimization

1. **Caching Strategy**:
   - Multi-level caching
   - Cache invalidation
   - Cache warming

2. **Query Optimization**:
   - Index optimization
   - Query caching
   - Connection pooling

3. **Load Testing**:
   - Performance benchmarks
   - Load testing tools
   - Optimization metrics

### Further Reconsiderations for a Real-Life Project

- Tech stack should be replanned based on high scale expectations
- API architecture should have an overview based on more detailed planning. For example patiend ID is now not mandatory to let the client save extra system logs. In a strict environment it may be undesirable behaviour.
