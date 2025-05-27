import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';

export enum LogSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
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

  @Column({
    type: 'enum',
    enum: LogSeverity,
    default: LogSeverity.INFO
  })
  @IsEnum(LogSeverity)
  severity!: LogSeverity;

  @Column('text')
  @IsString()
  message!: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  patientId?: string;

  @Column('simple-json', { nullable: true })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
} 