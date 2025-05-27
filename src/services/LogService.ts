import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Log, LogSeverity } from '../models/Log';
import { anonymizeLog } from '../utils/anonymization';

// Types
type FindAllOptions = {
  page?: number;
  limit?: number;
  severity?: LogSeverity;
  source?: string;
  after?: Date;
  before?: Date;
};

type StatsOptions = {
  after?: Date;
};

// Constants
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const LOG_ALIAS = 'log';

export class LogService {
  private repository: Repository<Log>;

  constructor() {
    this.repository = AppDataSource.getRepository(Log);
  }

  async create(logData: Partial<Log>): Promise<Log> {
    // Anonymize sensitive data before saving
    const anonymizedData = anonymizeLog(logData);
    const log = this.repository.create(anonymizedData);
    return await this.repository.save(log);
  }

  async findAll(options: FindAllOptions = {}): Promise<{ logs: Log[]; total: number }> {
    const {
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT,
      severity,
      source,
      after,
      before,
    } = options;

    const queryBuilder = this.repository
      .createQueryBuilder(LOG_ALIAS)
      .skip((page - 1) * limit)
      .take(limit);

    if (severity) {
      queryBuilder.andWhere(`${LOG_ALIAS}.severity = :severity`, { severity });
    }

    if (source) {
      queryBuilder.andWhere(`${LOG_ALIAS}.source = :source`, { source });
    }

    if (after) {
      queryBuilder.andWhere(`${LOG_ALIAS}.timestamp >= :after`, { after });
    }

    if (before) {
      queryBuilder.andWhere(`${LOG_ALIAS}.timestamp <= :before`, { before });
    }

    const [logs, total] = await queryBuilder.getManyAndCount();

    return { logs, total };
  }

  async findById(id: string): Promise<Log | null> {
    return await this.repository.findOneBy({ id });
  }

  async getStats(
    options: StatsOptions
  ): Promise<{ total: number; severityCounts: Record<LogSeverity, number> }> {
    const { after } = options;
    const queryBuilder = this.repository.createQueryBuilder(LOG_ALIAS);

    if (after) {
      queryBuilder.andWhere(`${LOG_ALIAS}.timestamp > :after`, { after });
    }

    const total = await queryBuilder.getCount();

    // Get counts for each severity level
    const severityCounts = Object.values(LogSeverity).reduce(
      (acc, severity) => {
        acc[severity] = 0;
        return acc;
      },
      {} as Record<LogSeverity, number>
    );

    const counts = await queryBuilder
      .select(`${LOG_ALIAS}.severity`, 'severity')
      .addSelect('COUNT(*)', 'count')
      .groupBy(`${LOG_ALIAS}.severity`)
      .getRawMany();

    counts.forEach(({ severity, count }) => {
      severityCounts[severity as LogSeverity] = parseInt(count);
    });

    return { total, severityCounts };
  }

  private applyFilters(
    queryBuilder: any,
    filters: { severity?: LogSeverity; source?: string; after?: Date }
  ): void {
    const { severity, source, after } = filters;

    if (severity) {
      queryBuilder.andWhere(`${LOG_ALIAS}.severity = :severity`, { severity });
    }

    if (source) {
      queryBuilder.andWhere(`${LOG_ALIAS}.source = :source`, { source });
    }

    if (after) {
      queryBuilder.andWhere(`${LOG_ALIAS}.timestamp > :after`, { after });
    }
  }
}
