import { DataSource } from "typeorm";
import { Log } from "../models/Log";
import "dotenv/config";

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as "sqlite",
  database: process.env.DB_NAME || "database.sqlite",
  synchronize: process.env.DB_SYNCHRONIZE === "true",
  logging: process.env.DB_LOGGING === "true",
  entities: [Log],
  migrations: [],
  subscribers: [],
});
