const axios = require("axios");
require("dotenv").config({ path: "../.env" });

// API configuration
const BASE_URL = "http://localhost:3131/api/v1";
const headers = {
  "Content-Type": "application/json",
  apikey: process.env.APIKEY || "your-api-key-here",
  "x-content-type-options": "nosniff",
  "x-xss-protection": "1; mode=block",
  "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
  "x-frame-options": "SAMEORIGIN",
};

let authToken = null;

// Helper to add delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to login and get token
async function login() {
  // First try to register
  try {
    await axios.post(
      `${BASE_URL}/auth/register`,
      {
        username: "testuser",
        email: "test@example.com",
        fullName: "Test User",
        password: "password123",
      },
      { headers },
    );
    console.log("✅ User registered");
  } catch (error) {
    // User may already exist, continue
  }

  // Now login
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/login`,
      {
        username: "testuser",
        password: "password123",
      },
      { headers },
    );

    if (response.data.success) {
      authToken = response.data.data.accessToken;
      console.log("✅ Login successful");
      return true;
    }
  } catch (error) {
    console.error("❌ Login failed:", error.response?.data || error.message);
    return false;
  }
}

// Helper to make authenticated request
async function makeRequest(endpoint, method = "GET", data = null) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      ...headers,
      Authorization: `Bearer ${authToken}`,
    },
  };

  if (data) {
    config.data = data;
  }

  return axios(config);
}

// Test 1: Normal requests under rate limit
async function testNormalRequests() {
  console.log("\n=== Test 1: Normal Requests (Under Rate Limit) ===");

  try {
    for (let i = 1; i <= 5; i++) {
      const response = await makeRequest("/products");
      console.log(
        `Request ${i}: Status ${response.status} - ${response.statusText}`,
      );
      console.log(
        `  Rate Limit: ${response.headers["x-ratelimit-remaining"]}/${response.headers["x-ratelimit-limit"]}`,
      );
      await delay(500);
    }
    console.log("✅ All normal requests completed");
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

// Test 2: Exceed rate limit and get queued
async function testRateLimitExceeded() {
  console.log("\n=== Test 2: Exceed Rate Limit (Should Queue) ===");

  const promises = [];
  const results = [];

  // Send 15 requests rapidly (rate limit is 10 per minute)
  for (let i = 1; i <= 15; i++) {
    promises.push(
      makeRequest("/products")
        .then((response) => {
          results.push({
            request: i,
            status: response.status,
            queued: response.status === 202,
            data: response.data,
          });
        })
        .catch((error) => {
          results.push({
            request: i,
            error: error.message,
            status: error.response?.status,
          });
        }),
    );
  }

  await Promise.all(promises);

  // Analyze results
  const normalRequests = results.filter((r) => r.status === 200);
  const queuedRequests = results.filter((r) => r.status === 202);
  const erroredRequests = results.filter((r) => r.error);

  console.log(`\n📊 Results:`);
  console.log(`  ✅ Normal requests: ${normalRequests.length}`);
  console.log(`  ⏳ Queued requests: ${queuedRequests.length}`);
  console.log(`  ❌ Errored requests: ${erroredRequests.length}`);

  // Show queue information for queued requests
  if (queuedRequests.length > 0) {
    console.log(`\n⏳ Queued Requests:`);
    queuedRequests.forEach((req, idx) => {
      console.log(`  ${idx + 1}. Request #${req.request}`);
      console.log(`     Queue Token: ${req.data.queueToken}`);
      console.log(`     Position: ${req.data.position}/${req.data.total}`);
      console.log(`     Estimated Wait: ${req.data.estimatedWait}s`);
    });

    // Test queue status check
    const firstQueued = queuedRequests[0];
    console.log(`\n=== Checking Queue Status ===`);
    await checkQueueStatus(firstQueued.data.queueToken);
  }
}

// Helper to check queue status
async function checkQueueStatus(queueToken) {
  try {
    const response = await makeRequest(`/queue/status/${queueToken}`);

    if (response.data.success) {
      const status = response.data.data;
      console.log(`Queue Status for token ${queueToken}:`);
      console.log(`  Status: ${status.status}`);
      console.log(`  Position: ${status.position || "N/A"}`);
      console.log(`  Total: ${status.total || "N/A"}`);
      console.log(`  Estimated Wait: ${status.estimatedWait || "N/A"}s`);

      if (status.result) {
        console.log(`  ✅ Result available`);
      }

      if (status.error) {
        console.log(`  ❌ Error: ${status.error}`);
      }
    }
  } catch (error) {
    console.error(
      "❌ Error checking queue status:",
      error.response?.data || error.message,
    );
  }
}

// Test 3: Check queue depth
async function testQueueDepth() {
  console.log("\n=== Test 3: Queue Depth ===");

  try {
    const response = await makeRequest("/queue/depth");

    if (response.data.success) {
      console.log(
        `Current Queue Depth: ${response.data.data.depth || response.data.data.queueDepth}`,
      );
    }
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

// Main test runner
async function runTests() {
  console.log("🚀 Starting Rate Limit and Queue Tests\n");
  console.log("Configuration:");
  console.log(`  Rate Limit: 10 requests per 60 seconds`);
  console.log(`  Base URL: ${BASE_URL}`);
  console.log("");

  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error("Cannot proceed without authentication");
    return;
  }

  // Run tests
  await testNormalRequests();
  await delay(2000);

  await testQueueDepth();
  await delay(1000);

  await testRateLimitExceeded();
  await delay(2000);

  await testQueueDepth();

  console.log("\n✅ All tests completed");
}

// Run the tests
runTests().catch(console.error);
