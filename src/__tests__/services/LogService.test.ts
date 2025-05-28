import { Repository } from 'typeorm';
import { LogService } from '../../services/LogService';
import { Log, LogSeverity } from '../../models/Log';
import { AppDataSource } from '../../config/database';

jest.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

type MockQueryBuilder = {
  skip: jest.Mock;
  take: jest.Mock;
  andWhere: jest.Mock;
  getManyAndCount: jest.Mock;
  getCount: jest.Mock;
  select: jest.Mock;
  addSelect: jest.Mock;
  groupBy: jest.Mock;
  getRawMany: jest.Mock;
};

describe('LogService', () => {
  let logService: LogService;
  let mockRepository: jest.Mocked<Repository<Log>>;
  let mockQueryBuilder: MockQueryBuilder;

  beforeEach(() => {
    // Mock repository methods
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    // Setup mock query builder
    mockQueryBuilder = {
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      getCount: jest.fn(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    };

    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

    // Setup AppDataSource mock
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);

    logService = new LogService();
  });

  describe('create', () => {
    it('should create and save a new log entry', async () => {
      const logData = {
        source: 'test-service',
        severity: LogSeverity.INFO,
        message: 'Test message',
        patient_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const createdLog = {
        id: '1',
        ...logData,
        timestamp: new Date(),
      };

      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      const result = await logService.create(logData);

      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        source: logData.source,
        severity: logData.severity,
        message: logData.message,
      }));
      expect(mockRepository.save).toHaveBeenCalledWith(createdLog);
      expect(result).toEqual(createdLog);
    });

    it('should anonymize patient_id before saving', async () => {
      const logData = {
        source: 'test-service',
        severity: LogSeverity.INFO,
        message: 'Test message',
        patient_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const createdLog = {
        id: '1',
        ...logData,
        timestamp: new Date(),
      };

      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await logService.create(logData);

      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        patient_id: expect.stringMatching(/^anon_[a-f0-9]{16}$/),
      }));
    });
  });

  describe('findAll', () => {
    it('should return paginated logs with default options', async () => {
      const mockLogs = [
        { id: '1', source: 'test', severity: LogSeverity.INFO, message: 'test1' },
        { id: '2', source: 'test', severity: LogSeverity.INFO, message: 'test2' },
      ];

      const mockQueryBuilder = mockRepository.createQueryBuilder();
      // @ts-ignore
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockLogs, 2]);

      const result = await logService.findAll();

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({ logs: mockLogs, total: 2 });
    });

    it('should apply all filters correctly', async () => {
      const options = {
        page: 2,
        limit: 5,
        severity: LogSeverity.ERROR,
        source: 'test-service',
        after: new Date('2024-01-01'),
        before: new Date('2024-12-31'),
      };

      const mockLogs = [
        { id: '1', source: 'test-service', severity: LogSeverity.ERROR, message: 'test1' },
      ];

      const mockQueryBuilder = mockRepository.createQueryBuilder();
      // @ts-ignore
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockLogs, 1]);

      await logService.findAll(options);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(4);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('log.severity = :severity', { severity: LogSeverity.ERROR });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('log.source = :source', { source: 'test-service' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('log.timestamp >= :after', { after: options.after });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('log.timestamp <= :before', { before: options.before });
    });
  });

  describe('findById', () => {
    it('should return a log by id', async () => {
      const mockLog = {
        id: '1',
        source: 'test-service',
        severity: LogSeverity.INFO,
        message: 'Test message',
      };

      mockRepository.findOneBy.mockResolvedValue(mockLog as Log);

      const result = await logService.findById('1');

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(result).toEqual(mockLog);
    });

    it('should return null for non-existent id', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await logService.findById('non-existent');

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'non-existent' });
      expect(result).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return correct severity counts', async () => {
      const mockCounts = [
        { severity: LogSeverity.INFO, count: '5' },
        { severity: LogSeverity.ERROR, count: '2' },
        { severity: LogSeverity.WARNING, count: '3' },
      ];

      const mockQueryBuilder = mockRepository.createQueryBuilder();
      // @ts-ignore
      mockQueryBuilder.getCount.mockResolvedValue(10);
      // @ts-ignore
      mockQueryBuilder.getRawMany.mockResolvedValue(mockCounts);

      const result = await logService.getStats({});

      expect(result).toEqual({
        total: 10,
        severityCounts: {
          info: 5,
          warning: 3,
          error: 2,
          critical: 0,
        },
      });
    });

    it('should apply after filter correctly', async () => {
      const after = new Date('2024-01-01');
      const mockQueryBuilder = mockRepository.createQueryBuilder();
      // @ts-ignore
      mockQueryBuilder.getCount.mockResolvedValue(5);
      // @ts-ignore
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await logService.getStats({ after });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('log.timestamp > :after', { after });
    });

    it('should handle empty database', async () => {
      const mockQueryBuilder = mockRepository.createQueryBuilder();
      // @ts-ignore
      mockQueryBuilder.getCount.mockResolvedValue(0);
      // @ts-ignore
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await logService.getStats({});

      expect(result).toEqual({
        total: 0,
        severityCounts: {
          info: 0,
          warning: 0,
          error: 0,
          critical: 0,
        },
      });
    });
  });
}); 