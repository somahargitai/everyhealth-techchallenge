import winston from "winston";
import morgan from "morgan";

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss.SSS",
    }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return ` [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
          } ${timestamp}`;
        })
      ),
    }),
  ],
});

// Create Morgan stream
const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Create Morgan middleware with custom format
morgan.token("status-emoji", (req, res) => {
  const status = res.statusCode;
  if (status >= 500) return "❌ ";
  if (status >= 400) return "⚠️ ";
  if (status >= 300) return "↪️ ";
  if (status >= 200) return "✅";
  return "❓ ";
});

const morganMiddleware = morgan(
  ":method :status-emoji :status - :url - :response-time ms",
  { stream: morganStream }
);

export { logger, morganMiddleware };
