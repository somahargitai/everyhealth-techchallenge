import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Every Health Logging API',
      version: '1.0.0',
      description: 'API for managing and querying health logs',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Log: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the log entry (auto-generated)',
              readOnly: true,
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'When the log was created (auto-generated)',
              readOnly: true,
            },
            source: {
              type: 'string',
              description: 'Service or component that created the log',
              example: 'test-service',
            },
            severity: {
              type: 'string',
              enum: ['info', 'warning', 'error', 'critical'],
              description: 'Severity level of the log',
              example: 'info',
            },
            message: {
              type: 'string',
              description: 'Log message',
              example: 'Test log message',
            },
            patient_id: {
              type: 'string',
              format: 'uuid',
              description: 'Patient identifier (must be a valid UUID)',
              example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
              nullable: true,
            },
            metadata: {
              type: 'object',
              description: 'Additional log metadata',
              additionalProperties: true,
              example: {
                additionalProp1: {},
              },
              nullable: true,
            },
          },
          required: ['source', 'severity', 'message'],
          example: {
            source: 'test-service',
            severity: 'info',
            message: 'Test log message',
            patient_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            metadata: {
              additionalProp1: {},
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Validation failed',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  property: {
                    type: 'string',
                    example: 'patient_id',
                  },
                  constraints: {
                    type: 'object',
                    properties: {
                      isUuid: {
                        type: 'string',
                        example: 'patient_id must be a UUID',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
