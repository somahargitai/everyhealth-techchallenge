import request from "supertest";
import { app } from "../app";

describe("Log Endpoints", () => {
  describe("POST /logs", () => {
    it("should create a new log entry", async () => {
      const logData = {
        source: "test-service",
        severity: "info",
        message: "Test log message",
        metadata: { test: true },
      };

      const response = await request(app)
        .post("/logs")
        .send(logData)
        .expect(201);

      expect(response.body).toBeValidLog();
      expect(response.body.source).toBe(logData.source);
      expect(response.body.severity).toBe(logData.severity);
      expect(response.body.message).toBe(logData.message);
    });

    it("should return 400 for invalid log data", async () => {
      const invalidLogData = {
        source: "test-service",
        // Missing required fields
      };

      await request(app).post("/logs").send(invalidLogData).expect(400);
    });
  });

  describe("GET /logs", () => {
    it("should return paginated logs", async () => {
      const response = await request(app)
        .get("/logs")
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty("logs");
      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("page");
      expect(response.body).toHaveProperty("limit");
      expect(Array.isArray(response.body.logs)).toBe(true);
    });

    it("should filter logs by severity", async () => {
      const response = await request(app)
        .get("/logs")
        .query({ severity: "error" })
        .expect(200);

      expect(
        response.body.logs.every((log: any) => log.severity === "error")
      ).toBe(true);
    });

    it("should filter logs by source", async () => {
      const response = await request(app)
        .get("/logs")
        .query({ source: "test-service" })
        .expect(200);

      expect(
        response.body.logs.every((log: any) => log.source === "test-service")
      ).toBe(true);
    });
  });

  describe("GET /logs/:id", () => {
    it("should return a specific log entry", async () => {
      // First create a log
      const logData = {
        source: "test-service",
        severity: "info",
        message: "Test log message",
      };

      const createResponse = await request(app)
        .post("/logs")
        .send(logData)
        .expect(201);

      const logId = createResponse.body.id;

      // Then fetch it
      const response = await request(app).get(`/logs/${logId}`).expect(200);

      expect(response.body).toBeValidLog();
      expect(response.body.id).toBe(logId);
    });

    it("should return 404 for non-existent log", async () => {
      await request(app).get("/logs/non-existent-id").expect(404);
    });
  });
});
