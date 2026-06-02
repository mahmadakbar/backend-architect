/**
 * Test script for Email Status Update
 * Tests order status change emails sent by admin/superadmin
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

// Test users (reused across tests)
const TEST_USER = {
  username: "testuser_functional",
  name: "Test User",
  password: "password123",
};

const ADMIN_USER = {
  username: "admin",
  password: "Admin@123",
};

let userToken = "";
let adminToken = "";
let orderId = null;
let orderCode = "";

/**
 * Login or register user (try login first, register if user doesn't exist)
 */
async function loginOrRegister() {
  try {
    // Try to login first
    console.log("\n🔐 Attempting to login as regular user...");
    const response = await axios.post(
      `${BASE_URL}/auth/login`,
      {
        username: TEST_USER.username,
        password: TEST_USER.password,
      },
      { headers: SECURITY_HEADERS },
    );

    userToken = response.data.data.accessToken;
    console.log("✅ Login successful (existing user)");
    console.log(`   Username: ${TEST_USER.username}`);
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

        userToken = loginResponse.data.data.accessToken;
        console.log("✅ Login successful (new user)");
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
 * Login as admin
 */
async function loginAsAdmin() {
  try {
    console.log("\n🔑 Logging in as admin...");
    const response = await axios.post(
      `${BASE_URL}/auth/login`,
      {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      },
      { headers: SECURITY_HEADERS },
    );

    adminToken = response.data.data.accessToken;
    console.log("✅ Admin login successful");
    console.log(`   Username: ${ADMIN_USER.username}`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Admin login failed:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

/**
 * Create an order (triggers async jobs)
 */
async function createOrder() {
  try {
    console.log("\n🛒 Creating order as regular user...");
    const response = await axios.post(
      `${BASE_URL}/orders`,
      {
        items: [
          {
            product_id: 1,
            quantity: 1,
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
          Authorization: `Bearer ${userToken}`,
        },
      },
    );

    const order = response.data.data;
    orderId = order.id;
    orderCode = order.code;

    console.log("✅ Order created successfully");
    console.log(`   Order ID: ${orderId}`);
    console.log(`   Order Code: ${orderCode}`);
    console.log(`   Total Amount: $${order.totalAmount}`);
    console.log(`   Initial Status: ${order.status}`);

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
 * Update order status (admin only)
 */
async function updateOrderStatus(newStatus) {
  try {
    console.log(`\n🔄 Updating order status to: ${newStatus}...`);
    const response = await axios.patch(
      `${BASE_URL}/orders/${orderId}/status`,
      {
        status: newStatus,
      },
      {
        headers: {
          ...SECURITY_HEADERS,
          Authorization: `Bearer ${adminToken}`,
        },
      },
    );

    const order = response.data.data;
    console.log(`✅ Order status updated successfully`);
    console.log(`   Order Code: ${order.code}`);
    console.log(`   New Status: ${order.status}`);
    console.log("\n⏳ Async jobs triggered:");
    console.log("   📧 Status update email");
    console.log("   📝 Activity log job");
    console.log("   🔔 Notification job");

    return order;
  } catch (error) {
    console.error(
      "❌ Status update failed:",
      error.response?.data || error.message,
    );
    throw error;
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
  console.log("🚀 Starting Email Status Update Test");
  console.log("=".repeat(60));

  try {
    // 1. Login or register regular user
    await loginOrRegister();

    // 2. Login as admin
    await loginAsAdmin();

    // 3. Create order as regular user
    const order = await createOrder();

    // 4. Wait for initial order emails to be sent
    await waitForJobs(90);
    console.log("\n📧 Initial emails (confirmation + invoice) should be sent");

    // 5. Update order status to PROCESSING (as admin)
    await updateOrderStatus("PROCESSING");
    await waitForJobs(90);

    // 6. Update order status to COMPLETED (as admin)
    await updateOrderStatus("COMPLETED");
    await waitForJobs(90);

    console.log("\n" + "=".repeat(60));
    console.log("✅ Test completed successfully!");
    console.log("\n📧 Email Instructions:");
    console.log("   Check your inbox at: alanmy.maulana@gmail.com");
    console.log("   You should receive:");
    console.log("   - Order Confirmation email (from order creation)");
    console.log("   - Invoice email (from order creation)");
    console.log("   - Status Update email: PENDING → PROCESSING");
    console.log("   - Status Update email: PROCESSING → COMPLETED");
    console.log("\n💡 Tip: Check spam folder if emails not in inbox");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    if (error.response?.data) {
      console.error(
        "   Error details:",
        JSON.stringify(error.response.data, null, 2),
      );
    }
    process.exit(1);
  }
}

// Run the test
main();
