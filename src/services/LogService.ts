import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Log, LogSeverity } from "../models/Log";
import { anonymizeLog } from "../utils/anonymization";

// Types
type FindAllOptions = {
  page?: number;
  limit?: number;
  severity?: LogSeverity;
  source?: string;
  after?: Date;
};

type SeverityCount = {
  log_severity: LogSeverity;
  count: string;
};

// Constants
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const LOG_ALIAS = "log";

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

  async findAll(options: FindAllOptions): Promise<{ logs: Log[]; total: number }> {
    const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, severity, source, after } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder(LOG_ALIAS);

    this.applyFilters(queryBuilder, { severity, source, after });

    const [logs, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy(`${LOG_ALIAS}.timestamp`, "DESC")
      .getManyAndCount();

    return { logs, total };
  }

  async findById(id: string): Promise<Log | null> {
    return await this.repository.findOneBy({ id });
  }

  async getStats(): Promise<Record<LogSeverity, number>> {
    const stats = await this.getSeverityCounts();
    const result = this.initializeSeverityCounts();
    this.updateSeverityCounts(result, stats);
    return result;
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

  private async getSeverityCounts(): Promise<SeverityCount[]> {
    return await this.repository
      .createQueryBuilder(LOG_ALIAS)
      .select(`${LOG_ALIAS}.severity`)
      .addSelect("COUNT(*)", "count")
      .groupBy(`${LOG_ALIAS}.severity`)
      .getRawMany<SeverityCount>();
  }

  private initializeSeverityCounts(): Record<LogSeverity, number> {
    const severities: LogSeverity[] = [LogSeverity.INFO, LogSeverity.WARNING, LogSeverity.ERROR, LogSeverity.CRITICAL];
    return severities.reduce((acc, severity) => {
      acc[severity] = 0;
      return acc;
    }, {} as Record<LogSeverity, number>);
  }

  private updateSeverityCounts(
    result: Record<LogSeverity, number>,
    stats: SeverityCount[]
  ): void {
    stats.forEach((stat) => {
      result[stat.log_severity] = parseInt(stat.count);
    });
  }
}
