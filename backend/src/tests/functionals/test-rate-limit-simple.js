const axios = require("axios");

// API configuration
const BASE_URL = "http://localhost:3131/api/v1";
const headers = {
  "Content-Type": "application/json",
  apikey: "sk_live_9K8mN3pQ7rT2vX5wY1zC4bF6hJ8nL0sA",
  "x-content-type-options": "nosniff",
  "x-xss-protection": "1; mode=block",
  "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
  "x-frame-options": "SAMEORIGIN",
};

// Helper to add delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to make request
async function makeRequest(endpoint, method = "GET", data = null) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers,
  };

  if (data) {
    config.data = data;
  }

  return axios(config);
}

// Test: Exceed rate limit and get queued
async function testRateLimitExceeded() {
  console.log("=== Testing Rate Limit with Queue System ===\n");
  console.log("Sending 15 rapid requests (Rate limit: 10 requests/minute)\n");

  const promises = [];
  const results = [];
  const startTime = Date.now();

  // Send 15 requests rapidly (rate limit is 10 per minute)
  for (let i = 1; i <= 15; i++) {
    promises.push(
      makeRequest("/products")
        .then((response) => {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
          results.push({
            request: i,
            status: response.status,
            queued: response.status === 202,
            data: response.data,
            elapsed,
            rateLimitRemaining: response.headers["x-ratelimit-remaining"],
            rateLimitLimit: response.headers["x-ratelimit-limit"],
          });
        })
        .catch((error) => {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
          results.push({
            request: i,
            error: error.message,
            status: error.response?.status,
            elapsed,
          });
        }),
    );
  }

  await Promise.all(promises);

  // Sort by request number
  results.sort((a, b) => a.request - b.request);

  // Analyze results
  const normalRequests = results.filter((r) => r.status === 200);
  const queuedRequests = results.filter((r) => r.status === 202);
  const erroredRequests = results.filter(
    (r) => r.error && r.status !== 202 && r.status !== 200,
  );

  console.log(
    `📊 Results after ${((Date.now() - startTime) / 1000).toFixed(2)}s:\n`,
  );
  console.log(`  ✅ Normal requests (200): ${normalRequests.length}`);
  console.log(`  ⏳ Queued requests (202): ${queuedRequests.length}`);
  console.log(`  ❌ Errored requests: ${erroredRequests.length}\n`);

  // Show detailed results
  console.log("Detailed Results:");
  results.forEach((req) => {
    const icon = req.status === 200 ? "✅" : req.status === 202 ? "⏳" : "❌";
    const remaining =
      req.rateLimitRemaining !== undefined
        ? ` (${req.rateLimitRemaining}/${req.rateLimitLimit} remaining)`
        : "";
    console.log(
      `  ${icon} Request #${req.request}: ${req.status || "ERROR"}${remaining} [${req.elapsed}s]`,
    );
  });

  // Show queue information for queued requests
  if (queuedRequests.length > 0) {
    console.log(`\n⏳ Queued Requests Details:`);
    queuedRequests.forEach((req, idx) => {
      console.log(`\n  ${idx + 1}. Request #${req.request}:`);
      console.log(`     Status: ${req.data.status}`);
      console.log(`     Message: ${req.data.message}`);
      console.log(`     Queue Token: ${req.data.queueToken}`);
      console.log(`     Position: ${req.data.position}/${req.data.total}`);
      console.log(`     Estimated Wait: ${req.data.estimatedWait}s`);
      console.log(`     Check Status URL: ${req.data.checkStatusUrl}`);
    });

    // Test queue status check for the first queued request
    const firstQueued = queuedRequests[0];
    console.log(
      `\n=== Checking Queue Status for Token: ${firstQueued.data.queueToken} ===\n`,
    );

    // Check status multiple times to see progression
    for (let i = 0; i < 3; i++) {
      await delay(2000);
      await checkQueueStatus(firstQueued.data.queueToken);
    }
  }
}

// Helper to check queue status
async function checkQueueStatus(queueToken) {
  try {
    const response = await makeRequest(`/queue/status/${queueToken}`);

    if (response.data.success) {
      const status = response.data.data;
      console.log(`  Status: ${status.status}`);
      console.log(`  Position: ${status.position || "N/A"}`);
      console.log(`  Total: ${status.total || "N/A"}`);
      console.log(`  Estimated Wait: ${status.estimatedWait || "N/A"}s`);

      if (status.result) {
        console.log(
          `  ✅ Result available: ${JSON.stringify(status.result).substring(0, 100)}...`,
        );
      }

      if (status.error) {
        console.log(`  ❌ Error: ${status.error}`);
      }
      console.log("");
    }
  } catch (error) {
    console.error(
      `  ❌ Error checking queue status: ${error.response?.data?.message || error.message}\n`,
    );
  }
}

// Test queue depth
async function testQueueDepth() {
  console.log("\n=== Current Queue Depth ===\n");

  try {
    const response = await makeRequest("/queue/depth");

    if (response.data.success) {
      const depth = response.data.data.depth || response.data.data.queueDepth;
      console.log(`  Queue Depth: ${depth} request(s) waiting\n`);
    }
  } catch (error) {
    console.error("  ❌ Error:", error.response?.data || error.message, "\n");
  }
}

// Main test runner
async function runTests() {
  console.log("🚀 Starting Rate Limit and Queue Tests\n");
  console.log("Configuration:");
  console.log(`  Rate Limit: 10 requests per 60 seconds`);
  console.log(`  Base URL: ${BASE_URL}`);
  console.log(`  Endpoint: GET /products\n`);

  // Run tests
  await testQueueDepth();
  await delay(1000);

  await testRateLimitExceeded();
  await delay(2000);

  await testQueueDepth();

  console.log("\n✅ All tests completed\n");
}

// Run the tests
runTests().catch(console.error);
