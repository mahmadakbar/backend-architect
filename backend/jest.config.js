module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        isolatedModules: true,
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@api/(.*)$": "<rootDir>/src/api/$1",
    "^@prisma/(.*)$": "<rootDir>/src/prisma/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@middlewares/(.*)$": "<rootDir>/src/middlewares/$1",
    "^@configs/(.*)$": "<rootDir>/src/configs/$1",
    "^@configs$": "<rootDir>/src/configs/index.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  collectCoverageFrom: [
    "src/api/**/*.service.ts",
    "!src/**/*.d.ts",
    "!src/tests/**",
    "!src/prisma/migrations/**",
    "!src/prisma/generated/**",
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};
