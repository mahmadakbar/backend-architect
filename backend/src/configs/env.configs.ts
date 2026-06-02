import "dotenv/config";

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  BRANCH: process.env.BRANCH || "development",
  PORT: process.env.PORT || "5000",
  BASE_URL: process.env.BASE_URL || "http://localhost:5000",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: parseInt(process.env.REDIS_PORT || "6379"),
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"), // 1 minute
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "10"), // 10 requests per window
  },
  JWT: {
    SECRET: process.env.JWT_ACCESS_SECRET || "",
    REFRESH: process.env.JWT_REFRESH_SECRET || "",
    EXPIRES: {
      ACCESS: process.env.JWT_ACCESS_EXPIRES || "60m",
      REFRESH: process.env.JWT_REFRESH_EXPIRES || "7d",
    },
  },
  KEY: {
    SECRET: process.env.KEY_SECRET || "",
  },
  APIKEY: process.env.APIKEY || "",
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587"),
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  SMTP_FROM: process.env.SMTP_FROM || "noreply@ecommerce.com",
  TELEMETRY: {
    ENABLED: process.env.TELEMETRY_ENABLED === "true",
    SERVICE_NAME: process.env.TELEMETRY_SERVICE_NAME || "ecommerce-backend",
    SERVICE_VERSION: process.env.TELEMETRY_SERVICE_VERSION || "1.0.0",
    OTLP_ENDPOINT:
      process.env.TELEMETRY_OTLP_ENDPOINT || "http://localhost:4318",
  },
};

export default env;
export { env, env as EnvConfig };
