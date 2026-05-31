export const env = {
  // Use INTERNAL_API_URL for server-side calls in Docker, fallback to NEXT_PUBLIC_API_URL
  API_URL: process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL,
  // Client-side API URL (exposed to browser)
  CLIENT_API_URL: process.env.NEXT_PUBLIC_API_URL,
  KEY: {
    SECRET: process.env.NEXT_PUBLIC_KEY_SECRET || "",
  },
};
