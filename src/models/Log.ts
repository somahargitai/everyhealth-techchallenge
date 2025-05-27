import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { IsString, IsEnum, IsOptional, IsObject, IsUUID } from 'class-validator';

export enum LogSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  timestamp!: Date;

  @Column()
  @IsString()
  source!: string;

  @Column()
  @IsEnum(LogSeverity)
  severity!: LogSeverity;

  @Column('text')
  @IsString()
  message!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsUUID()
  patient_id?: string;

  @Column('simple-json', { nullable: true })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
