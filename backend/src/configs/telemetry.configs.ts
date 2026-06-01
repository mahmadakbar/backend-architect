import env from "./env.configs";

let sdk: any = null;

// Only initialize OpenTelemetry when enabled
if (env.TELEMETRY.ENABLED) {
  try {
    const { NodeSDK } = require("@opentelemetry/sdk-node");
    const {
      getNodeAutoInstrumentations,
    } = require("@opentelemetry/auto-instrumentations-node");
    const { PrismaInstrumentation } = require("@prisma/instrumentation");
    const {
      OTLPTraceExporter,
    } = require("@opentelemetry/exporter-trace-otlp-http");
    const {
      OTLPMetricExporter,
    } = require("@opentelemetry/exporter-metrics-otlp-http");
    const { resourceFromAttributes } = require("@opentelemetry/resources");
    const {
      ATTR_SERVICE_NAME,
      ATTR_SERVICE_VERSION,
    } = require("@opentelemetry/semantic-conventions");
    const {
      PeriodicExportingMetricReader,
    } = require("@opentelemetry/sdk-metrics");

    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: env.TELEMETRY.SERVICE_NAME,
      [ATTR_SERVICE_VERSION]: env.TELEMETRY.SERVICE_VERSION,
      "deployment.environment": env.BRANCH,
    });

    // Configure trace exporter
    const traceExporter = new OTLPTraceExporter({
      url: env.TELEMETRY.OTLP_ENDPOINT + "/v1/traces",
    });

    // Configure metric exporter
    const metricExporter = new OTLPMetricExporter({
      url: env.TELEMETRY.OTLP_ENDPOINT + "/v1/metrics",
    });

    const metricReader = new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 60000,
    });

    // Initialize OpenTelemetry SDK
    sdk = new NodeSDK({
      resource,
      traceExporter,
      metricReader,
      instrumentations: [
        getNodeAutoInstrumentations({
          "@opentelemetry/instrumentation-fs": { enabled: false },
          "@opentelemetry/instrumentation-http": { enabled: true },
          "@opentelemetry/instrumentation-express": { enabled: true },
        }),
        new PrismaInstrumentation(),
      ],
    });

    // Start the SDK
    if (sdk && typeof sdk.start === "function") {
      try {
        const startResult = sdk.start();

        if (startResult && typeof startResult.then === "function") {
          startResult
            .then(() => {
              console.log("📊 OpenTelemetry initialized successfully");
              console.log(`   Service: ${env.TELEMETRY.SERVICE_NAME}`);
              console.log(`   Endpoint: ${env.TELEMETRY.OTLP_ENDPOINT}`);
            })
            .catch((error: any) => {
              console.error("❌ Error initializing OpenTelemetry:", error);
            });
        } else {
          // Synchronous start (Bun runtime)
          console.log("📊 OpenTelemetry initialized successfully");
          console.log(`   Service: ${env.TELEMETRY.SERVICE_NAME}`);
          console.log(`   Endpoint: ${env.TELEMETRY.OTLP_ENDPOINT}`);
        }
      } catch (error) {
        console.error("❌ Error starting OpenTelemetry:", error);
      }

      // Graceful shutdown
      process.on("SIGTERM", () => {
        if (sdk && typeof sdk.shutdown === "function") {
          const shutdownResult = sdk.shutdown();
          if (shutdownResult && typeof shutdownResult.then === "function") {
            shutdownResult
              .then(() => console.log("📊 OpenTelemetry terminated"))
              .catch((error: any) =>
                console.error("Error terminating OpenTelemetry", error),
              )
              .finally(() => process.exit(0));
          } else {
            console.log("📊 OpenTelemetry terminated");
            process.exit(0);
          }
        }
      });
    } else {
      console.error("❌ NodeSDK.start() is not available");
    }
  } catch (error) {
    console.error("❌ Failed to load OpenTelemetry:", error);
    sdk = null;
  }
} else {
  console.log("📊 OpenTelemetry is disabled");
}

export default sdk;
