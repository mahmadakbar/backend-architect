/**
 * Quick test to check auth response structure
 */
const axios = require("axios");

const BASE_URL = "http://localhost:3131/api/v1";
const API_KEY = "sk_live_9K8mN3pQ7rT2vX5wY1zC4bF6hJ8nL0sA";

const SECURITY_HEADERS = {
  apikey: API_KEY,
  "x-content-type-options": "nosniff",
  "x-xss-protection": "1; mode=block",
  "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
  "x-frame-options": "SAMEORIGIN",
};

async function test() {
  try {
    // Register
    const regResponse = await axios.post(
      `${BASE_URL}/auth/register`,
      {
        username: `test_${Date.now()}`,
        name: "Test User",
        password: "password123",
      },
      { headers: SECURITY_HEADERS },
    );
    console.log(
      "Register response:",
      JSON.stringify(regResponse.data, null, 2),
    );

    // Login
    const loginResponse = await axios.post(
      `${BASE_URL}/auth/login`,
      {
        username: regResponse.data.data.username,
        password: "password123",
      },
      { headers: SECURITY_HEADERS },
    );
    console.log(
      "\nLogin response:",
      JSON.stringify(loginResponse.data, null, 2),
    );
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

test();
