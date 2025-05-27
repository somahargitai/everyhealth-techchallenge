import { DataSource } from "typeorm";
import { Log } from "../models/Log";
import "dotenv/config";

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as "sqlite",
  database: process.env.DB_NAME || "database.sqlite",
  synchronize: process.env.DB_SYNCHRONIZE === "true",
  logging: process.env.DB_LOGGING === "true",
  entities: [Log],
  subscribers: [],
  extra: {
    // Add SQLite specific options to handle concurrent access
    busyTimeout: 5000, // Wait up to 5 seconds for the database to be available
    journalMode: 'WAL', // Use Write-Ahead Logging for better concurrency
  }
});
