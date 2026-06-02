/**
 * Test script for Email Async Job System
 * Tests order creation with real email sending via Gmail SMTP
 */

const axios = require("axios");

const BASE_URL = "http://localhost:3131/api/v1";
const API_KEY = "sk_live_9K8mN3pQ7rT2vX5wY1zC4bF6hJ8nL0sA";

// Security headers required by the API
const SECURITY_HEADERS = {
  apikey: API_KEY,
  "x-content-type-options": "nosniff",
  "x-xss-protection": "1; mode=block",
  "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
  "x-frame-options": "SAMEORIGIN",
};

// Test user credentials (reused across tests)
const TEST_USER = {
  username: "testuser_functional",
  name: "Test User",
  password: "password123",
};

let authToken = "";

/**
 * Login or register user (try login first, register if user doesn't exist)
 */
async function loginOrRegister() {
  try {
    // Try to login first
    console.log("\n🔐 Attempting to login...");
    const response = await axios.post(
      `${BASE_URL}/auth/login`,
      {
        username: TEST_USER.username,
        password: TEST_USER.password,
      },
      { headers: SECURITY_HEADERS },
    );

    authToken = response.data.data.accessToken;
    console.log("✅ Login successful (existing user)");
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    return response.data;
  } catch (error) {
    // If login fails, try to register
    if (error.response?.status === 404 || error.response?.status === 401) {
      console.log("👤 User not found, registering new user...");
      try {
        await axios.post(`${BASE_URL}/auth/register`, TEST_USER, {
          headers: SECURITY_HEADERS,
        });
        console.log("✅ User registered successfully");

        // Now login with the new user
        const loginResponse = await axios.post(
          `${BASE_URL}/auth/login`,
          {
            username: TEST_USER.username,
            password: TEST_USER.password,
          },
          { headers: SECURITY_HEADERS },
        );

        authToken = loginResponse.data.data.accessToken;
        console.log("✅ Login successful (new user)");
        console.log(`   Token: ${authToken.substring(0, 20)}...`);
        return loginResponse.data;
      } catch (registerError) {
        console.error(
          "❌ Registration failed:",
          registerError.response?.data || registerError.message,
        );
        throw registerError;
      }
    } else {
      console.error("❌ Login failed:", error.response?.data || error.message);
      throw error;
    }
  }
}

/**
 * Create an order (triggers async jobs)
 */
async function createOrder() {
  try {
    console.log("\n🛒 Creating order...");
    const response = await axios.post(
      `${BASE_URL}/orders`,
      {
        items: [
          {
            product_id: 1,
            quantity: 2,
          },
          {
            product_id: 2,
            quantity: 1,
          },
        ],
      },
      {
        headers: {
          ...SECURITY_HEADERS,
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const order = response.data.data;
    console.log("✅ Order created successfully");
    console.log(`   Order Code: ${order.code}`);
    console.log(`   Total Amount: $${order.totalAmount}`);
    console.log(`   Status: ${order.status}`);
    console.log("\n⏳ Async jobs triggered:");
    console.log("   📧 Email job (invoice + confirmation)");
    console.log("   📝 Activity log job");
    console.log("   🔔 Notification job");

    return order;
  } catch (error) {
    console.error(
      "❌ Order creation failed:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

/**
 * Get queue metrics
 */
async function getQueueMetrics() {
  try {
    console.log("\n📊 Fetching queue metrics...");
    const response = await axios.get(`${BASE_URL}/jobs/metrics`, {
      headers: {
        ...SECURITY_HEADERS,
        Authorization: `Bearer ${authToken}`,
      },
    });

    console.log("✅ Queue metrics retrieved:");
    response.data.data.queues.forEach((queue) => {
      console.log(`\n   ${queue.queueName}:`);
      console.log(`      Waiting: ${queue.waiting}`);
      console.log(`      Active: ${queue.active}`);
      console.log(`      Completed: ${queue.completed}`);
      console.log(`      Failed: ${queue.failed}`);
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log("⚠️  Queue metrics require admin role (this is expected)");
    } else {
      console.error(
        "❌ Failed to get queue metrics:",
        error.response?.data || error.message,
      );
    }
  }
}

/**
 * Wait for jobs to process
 */
async function waitForJobs(seconds = 5) {
  console.log(`\n⏳ Waiting ${seconds} seconds for jobs to process...`);
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  console.log("✅ Wait complete");
}

/**
 * Main test flow
 */
async function main() {
  console.log("🚀 Starting Email Async Job System Test");
  console.log("=".repeat(60));

  try {
    // 1. Login or register user (reuse existing test user)
    await loginOrRegister();

    // 2. Create order (triggers async jobs)
    const order = await createOrder();

    // 3. Wait for jobs to process
    await waitForJobs(10);

    // 4. Try to get queue metrics (requires admin role)
    await getQueueMetrics();

    console.log("\n" + "=".repeat(60));
    console.log("✅ Test completed successfully!");
    console.log("\n📧 Email Instructions:");
    console.log("   Check your inbox at: alanmy.maulana@gmail.com");
    console.log("   You should receive:");
    console.log("   - Order Confirmation email");
    console.log("   - Invoice email");
    console.log("\n💡 Tip: Check spam folder if emails not in inbox");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run the test
main();
