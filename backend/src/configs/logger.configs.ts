import pino from "pino";
import env from "./env.configs";

let transport;
try {
  transport =
    env.BRANCH === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined;
} catch (error) {
  console.warn("Failed to configure pino transport, using defaults", error);
  transport = undefined;
}

const logger = pino({
  level: env.LOG_LEVEL || "info",
  transport,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
