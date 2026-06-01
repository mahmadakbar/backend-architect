import pino from "pino";
import { trace, context } from "@opentelemetry/api";
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
  // Mixin to add trace context to every log
  mixin() {
    const span = trace.getSpan(context.active());
    if (!span) return {};

    const spanContext = span.spanContext();
    return {
      trace_id: spanContext.traceId,
      span_id: spanContext.spanId,
      trace_flags: spanContext.traceFlags,
    };
  },
});

export default logger;
