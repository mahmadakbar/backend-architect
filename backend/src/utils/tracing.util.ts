import { trace, context, Span, SpanStatusCode } from "@opentelemetry/api";
import logger from "@configs/logger.configs";

const tracer = trace.getTracer("ecommerce-backend");

/**
 * Create a new span for tracing operations
 * @param name - Name of the span
 * @param fn - Async function to execute within the span
 * @param attributes - Optional attributes to add to the span
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  attributes?: Record<string, string | number | boolean>,
): Promise<T> {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      // Add custom attributes if provided
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }

      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error: any) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      logger.error({ error, span_name: name }, "Error in traced operation");
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Get the current trace ID for logging correlation
 */
export function getCurrentTraceId(): string | undefined {
  const span = trace.getSpan(context.active());
  return span?.spanContext().traceId;
}

/**
 * Get the current span ID for logging correlation
 */
export function getCurrentSpanId(): string | undefined {
  const span = trace.getSpan(context.active());
  return span?.spanContext().spanId;
}

/**
 * Add an event to the current span
 * @param name - Event name
 * @param attributes - Event attributes
 */
export function addSpanEvent(
  name: string,
  attributes?: Record<string, string | number | boolean>,
): void {
  const span = trace.getSpan(context.active());
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * Set an attribute on the current span
 * @param key - Attribute key
 * @param value - Attribute value
 */
export function setSpanAttribute(
  key: string,
  value: string | number | boolean,
): void {
  const span = trace.getSpan(context.active());
  if (span) {
    span.setAttribute(key, value);
  }
}

export { tracer };
