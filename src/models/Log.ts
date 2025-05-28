import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { IsString, IsEnum, IsOptional, IsObject, IsUUID, IsNotEmpty } from 'class-validator';

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

  @CreateDateColumn({ type: 'datetime' })
  timestamp!: Date;

  @Column()
  @IsString()
  @IsNotEmpty()
  source!: string;

  @Column('varchar')
  @IsEnum(LogSeverity)
  @IsNotEmpty()
  severity!: LogSeverity;

  @Column('text')
  @IsString()
  @IsNotEmpty()
  message!: string;

  @Column({ nullable: true })
  @IsUUID()
  @IsOptional()
  patient_id?: string;

  @Column('json', { nullable: true })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
