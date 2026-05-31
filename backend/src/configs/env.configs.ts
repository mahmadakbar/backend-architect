import "dotenv/config";

const env = {
  BRANCH: process.env.BRANCH || "development",
  PORT: process.env.PORT || "5000",
  BASE_URL: process.env.BASE_URL || "http://localhost:5000",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  JWT: {
    SECRET: process.env.JWT_ACCESS_SECRET || "",
    REFRESH: process.env.JWT_REFRESH_SECRET || "",
    EXPIRES: {
      ACCESS: process.env.JWT_ACCESS_EXPIRES || "60m",
      REFRESH: process.env.JWT_REFRESH_EXPIRES || "7d",
    },
  },
  KEY: {
    SECRET: process.env.KEY_SECRET || "",
  },
};

export default env;
