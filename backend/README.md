# E-Commerce API

A robust and scalable RESTful API for e-commerce built with modern technologies including Express.js, Prisma ORM, JWT authentication, and comprehensive API documentation.

---

## 📚 Table of Contents

- [Technologies](#-technologies)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Manual Setup](#manual-setup)
  - [Docker Setup](#docker-setup)

- [API Documentation](#-api-documentation)
  - [Required Security Headers](#-required-security-headers)

- [Async Job Processing](#-async-job-processing)
- [Adding New APIs](#-adding-new-apis)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Functional Testing](#-functional-testing)
- [Security Features](#-security-features)

---

## 🚀 Technologies

This project leverages modern and production-ready technologies:

### Core Framework & Runtime

- **Express.js** - Fast, unopinionated web framework for Node.js
- **Bun** - Fast all-in-one JavaScript runtime (also compatible with Node.js)
- **TypeScript** - Typed superset of JavaScript for better development experience

### Authentication & Security

- **JWT (JSON Web Tokens)** - Secure token-based authentication
  - Access tokens (default: 60 minutes)
  - Refresh tokens (default: 7 days)
  - Token verification middleware for protected routes

- **bcryptjs** - Password hashing and encryption
- **Helmet** - Security headers middleware
- **CORS** - Cross-Origin Resource Sharing configuration

### Database & ORM

- **Prisma** - Next-generation ORM for PostgreSQL
  - Type-safe database queries
  - Auto-generated types based on schema
  - Easy migration management
  - Built-in connection pooling

- **PostgreSQL** - Robust relational database

### API Documentation

- **Swagger UI Express** - Interactive API documentation
  - Accessible at `/api-docs`
  - Auto-generated from code annotations
  - Try-it-out functionality for testing endpoints

- **Swagger Autogen** - Automatic Swagger documentation generation

### Logging

- **Pino** - Extremely fast Node.js logger
  - Structured JSON logging
  - Different log levels (info, error, warn, debug)
  - Better performance than console.log

- **Pino-HTTP** - HTTP request logging middleware
- **Pino-Pretty** - Prettifies Pino logs in development

### Validation

- **Joi** - Powerful schema validation
- **Zod** - TypeScript-first schema validation
- **Express Validator** - Middleware for request validation

### Development Tools

- **Nodemon** - Auto-restart on file changes
- **ts-node** - TypeScript execution for Node.js
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library for testing

### Rate Limiting & Queue Management

- **Redis** - In-memory data structure store
  - Rate limiting with atomic operations
  - Request queue management
  - Session storage
  - Real-time data caching

- **ioredis** - Advanced Redis client
  - Connection pooling
  - Automatic reconnection
  - TypeScript support
  - Atomic operations (INCR, PEXPIRE)

- **Socket.IO** - Real-time bidirectional communication
  - Queue status updates
  - WebSocket connections with automatic fallback
  - Room-based event broadcasting

**Rate Limiting Features:**

- Token bucket algorithm with Redis
- UX-friendly: Returns 202 Accepted instead of errors
- Queue system for rate-limited requests
- Real-time queue status updates via Socket.IO
- Automatic request processing by background worker

### Async Job Processing with BullMQ

- **BullMQ** - Redis-based job queue for background processing
  - Reliable job processing with Redis persistence
  - Retry mechanism with exponential backoff
  - Dead letter queue for failed jobs
  - Job prioritization and rate limiting
  - Concurrent job processing

- **Nodemailer** - Email service for transactional emails
  - Gmail SMTP integration (SSL on port 465)
  - HTML email templates with IDR currency format
  - Invoice and order confirmation emails

**Job Types:**

1. **Email Jobs** - Send invoices and order confirmations
2. **Activity Log Jobs** - Record user actions to database
3. **Notification Jobs** - Create in-app notifications
4. **Order Processing Jobs** - Orchestrate all jobs for order events

**Async Job Features:**

- ✅ **Retry Mechanism**: 3 attempts with exponential backoff (2s → 4s → 8s)
- ✅ **Dead Letter Queue**: Failed jobs stored for manual inspection
- ✅ **Idempotency**: Redis-based duplicate prevention (24h TTL)
- ✅ **Concurrent Processing**: Configurable workers per job type
- ✅ **Admin Monitoring**: API endpoints for queue metrics and management

### Data Encryption

- **Custom Encryption Helper** - Implements AES-256-CBC encryption
  - Encrypts sensitive data before storing in database
  - Decrypts data when retrieving from database
  - Uses secret key from environment variables

---

## 📁 Project Structure

```ini
backend/
├── src/
│   ├── app.ts                      # Application entry point
│   ├── api/                        # API routes
│   │   ├── api.routes.ts          # Main API router
│   │   └── v1/                    # API version 1
│   │       ├── v1.routes.ts       # V1 router (combines all v1 routes)
│   │       ├── auth/              # Authentication module
│   │       │   ├── auth.controller.ts   # Request handlers
│   │       │   ├── auth.service.ts      # Business logic
│   │       │   ├── auth.routes.ts       # Route definitions
│   │       │   └── auth.validation.ts   # Request validation schemas
│   │       └── tasks/             # Tasks module
│   │           ├── tasks.controller.ts
│   │           ├── tasks.service.ts
│   │           ├── tasks.routes.ts
│   │           └── tasks.validation.ts
│   ├── configs/                   # Configuration files
│   │   ├── env.configs.ts        # Environment variables
│   │   ├── logger.configs.ts     # Pino logger setup
│   │   └── swagger.config.ts     # Swagger documentation config
│   ├── middlewares/               # Express middlewares
│   │   ├── auth.middleware.ts    # JWT authentication
│   │   ├── validation.middleware.ts  # Request validation
│   │   └── errorHandler.middleware.ts # Error handling
│   ├── prisma/                    # Database
│   │   ├── schema.prisma         # Database schema
│   │   ├── prisma.clients.ts     # Prisma client instance
│   │   └── migrations/           # Database migrations
│   ├── utils/                     # Utility functions
│   │   ├── jwt.util.ts           # JWT token generation/verification
│   │   ├── error.utils.ts        # Custom error classes
│   │   ├── validator.util.ts     # Validation helpers
│   │   └── helper/
│   │       ├── encryption.helper.ts  # Data encryption/decryption
│   │       └── cookies.helper.ts     # Cookie handling
│   └── interfaces/                # TypeScript interfaces
│       └── global.d.ts           # Global type definitions
├── docker-compose.yml             # Docker services configuration
├── Dockerfile                     # Docker image definition
├── package.json                   # Dependencies and scripts
└── tsconfig.json                  # TypeScript configuration
```

### Architecture Pattern

The project follows a **modular, feature-based architecture**:

1. **Separation of Concerns**: Each feature (auth, tasks) is organized in its own directory
2. **Layered Architecture**:
   - **Routes** → Define endpoints and attach middlewares
   - **Controllers** → Handle HTTP requests/responses
   - **Services** → Contain business logic
   - **Validation** → Validate incoming requests

3. **Centralized Configuration**: All configs in one place for easy management
4. **Middleware Pattern**: Reusable middlewares for authentication, validation, and error handling

---

## 🏁 Getting Started

### Prerequisites

Before running this project, ensure you have:

- **Bun** (v1.0 or higher) or **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Docker & Docker Compose** (for containerized setup)

### Manual Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend
```

#### 2. Install Dependencies

```bash
bun install
# or
npm install
```

#### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Application
PORT=3131
BASE_URL=http://localhost:3131
NODE_ENV=development
BRANCH=development
LOG_LEVEL=info

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/task_management?schema=public"

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_ACCESS_EXPIRES=60m
JWT_REFRESH_EXPIRES=7d

# Encryption Key
KEY_SECRET=your-32-character-encryption-key
```

> ⚠️ **Important**: Change all secret keys to secure random values in production!

#### 4. Set Up Database

```bash
# Generate Prisma Client
bun run prisma:generate

# Run database migrations
bun run prisma:migrate

# (Optional) Open Prisma Studio to view database
bun run prisma:studio
```

#### 5. Start Development Server

```bash
bun run dev
```

The API will be available at `http://localhost:3131`

---

### Docker Setup

Docker setup includes PostgreSQL database and the application in isolated containers.

#### 1. Configure Docker Environment

Create a `.env.docker` file (or use `.env`):

```env
# Application
PORT=3131
BASE_URL=http://localhost:3131
NODE_ENV=production
BRANCH=production
LOG_LEVEL=info

# Database Configuration
DB_USER=testtodo
DB_PASSWORD=admin123
DB_NAME=todo_postgres
DB_PORT=5432

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRES=60m
JWT_REFRESH_EXPIRES=7d

# Encryption
KEY_SECRET=your-32-character-encryption-key
```

#### 2. Build and Start Services

```bash
# Build Docker images
bun run docker:build

# Start all services (app + PostgreSQL)
bun run docker:up

# View logs
bun run docker:logs
```

#### 3. Run Database Migrations (First Time Only)

```bash
bun run docker:migrate
```

#### 4. Access Services

- **API**: http://localhost:3131
- **API Documentation**: http://localhost:3131/api-docs
- **PostgreSQL**: localhost:5432

#### 5. Optional: Prisma Studio in Docker

```bash
# Start Prisma Studio for database management
bun run docker:studio
```

Access Prisma Studio at: http://localhost:5555

#### Docker Management Commands

```bash
# Stop all services
bun run docker:down

# Restart application
bun run docker:restart

# Clean up (removes volumes)
bun run docker:clean

# View real-time logs
docker-compose logs -f
```

---

## 📖 API Documentation

Interactive API documentation is available via **Swagger UI**.

### Accessing Documentation

1. Start the server (manual or Docker)
2. Navigate to: **http://localhost:3131/api-docs**

### Documentation Features

- **Interactive Testing**: Try out API endpoints directly from the browser
- **Request/Response Schemas**: View expected data structures
- **Authentication**: Add JWT tokens to test protected endpoints
- **Auto-generated**: Updated automatically from code annotations

### Authentication in Swagger

1. Click the **"Authorize"** button in Swagger UI
2. Enter your token in the format: `Bearer <your-access-token>`
3. Click "Authorize" to authenticate all requests

### 🔐 Required Security Headers

**All API requests MUST include the following headers:**

| Header                      | Required Value                                 | Description                 |
| --------------------------- | ---------------------------------------------- | --------------------------- |
| `apikey`                    | Your API key from `.env`                       | API authentication key      |
| `x-content-type-options`    | `nosniff`                                      | Prevents MIME type sniffing |
| `x-xss-protection`          | `1; mode=block`                                | Enables XSS protection      |
| `strict-transport-security` | `max-age=31536000; includeSubDomains; preload` | Enforces HTTPS              |
| `x-frame-options`           | `SAMEORIGIN`                                   | Prevents clickjacking       |

**Example Request:**

```bash
curl -X GET "http://localhost:3131/api/v1/products" \
  -H "apikey: sk_live_9K8mN3pQ7rT2vX5wY1zC4bF6hJ8nL0sA" \
  -H "x-content-type-options: nosniff" \
  -H "x-xss-protection: 1; mode=block" \
  -H "strict-transport-security: max-age=31536000; includeSubDomains; preload" \
  -H "x-frame-options: SAMEORIGIN"
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid API key
- `400 Bad Request` - Invalid security header values

**Note:** The frontend automatically includes these headers when using the configured axios instance. See `frontend/src/services/network/index.ts` for implementation.

---

## ➕ Adding New APIs

Follow these steps to add a new API module to the project:

### Step 1: Create Module Directory

Create a new directory under `src/api/v1/`:

```bash
mkdir -p src/api/v1/your-module
```

### Step 2: Create Module Files

Create the following files in your module directory:

#### `your-module.routes.ts`

```typescript
import { Router } from "express";
import { MAuthToken } from "@middlewares";
import validator from "@utils/validator.util";
import { VCreateItem } from "./your-module.validation";
import { CCreateItem, CGetItems } from "./your-module.controller";

const router = Router();

// Apply authentication middleware to all routes
router.use(MAuthToken);

// Define routes
router.post("/", validator.body(VCreateItem), CCreateItem);
router.get("/", CGetItems);

export default router;
```

#### `your-module.validation.ts`

```typescript
import Joi from "joi";

export const VCreateItem = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().optional(),
});

export const VUpdateItem = Joi.object({
  name: Joi.string().optional().min(3).max(100),
  description: Joi.string().optional(),
});
```

#### `your-module.controller.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import { SCreateItem, SGetItems } from "./your-module.service";

export const CCreateItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const result = await SCreateItem(req.body, userId);

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const CGetItems = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const items = await SGetItems(userId);

    res.status(200).json({
      success: true,
      message: "Items retrieved successfully",
      data: items,
    });
  } catch (error) {
    next(error);
  }
};
```

#### `your-module.service.ts`

```typescript
import { prisma } from "@prisma/prisma.clients";
import { ApiError } from "@utils/error.utils";

export const SCreateItem = async (data: any, userId: number) => {
  // Business logic here
  const item = await prisma.yourModel.create({
    data: {
      ...data,
      userId,
    },
  });

  return item;
};

export const SGetItems = async (userId: number) => {
  const items = await prisma.yourModel.findMany({
    where: { userId },
  });

  return items;
};
```

### Step 3: Update Prisma Schema

Add your new model to `src/prisma/schema.prisma`:

```prisma
model YourModel {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  userId      Int
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime? @updatedAt

  @@map("your_table_name")
}
```

Don't forget to update the User model if needed:

```prisma
model User {
  // ... existing fields
  yourModels  YourModel[]
}
```

### Step 4: Run Database Migration

```bash
# Generate migration
bun run prisma:migrate

# Generate Prisma Client
bun run prisma:generate
```

### Step 5: Register Routes

Update `src/api/v1/v1.routes.ts`:

```typescript
import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import tasksRoutes from "./tasks/tasks.routes";
import yourModuleRoutes from "./your-module/your-module.routes"; // Add this

const router = Router();

router.use("/auth", authRoutes);
router.use("/tasks", tasksRoutes);
router.use("/your-module", yourModuleRoutes); // Add this

export default router;
```

### Step 6: Add Swagger Documentation

Add Swagger comments to your routes for automatic documentation:

```typescript
router.post("/", validator.body(VCreateItem), CCreateItem);
// #swagger.tags = ['Your Module']
// #swagger.summary = 'Create a new item'
// #swagger.security = [{ "bearerAuth": [] }]
/* #swagger.requestBody = {
  required: true,
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Item name' },
          description: { type: 'string', example: 'Item description' }
        }
      }
    }
  }
} */
```

### Step 7: Test Your API

1. Restart the development server
2. Check Swagger UI at `/api-docs` to see your new endpoints
3. Test the endpoints using Swagger UI or Postman

---

## 🔐 Environment Variables

| Variable                  | Description                          | Default                | Required |
| ------------------------- | ------------------------------------ | ---------------------- | -------- |
| `PORT`                    | Application port                     | 5000                   | No       |
| `BASE_URL`                | Base URL for the application         | http://localhost:5000  | No       |
| `NODE_ENV`                | Environment (development/production) | development            | No       |
| `BRANCH`                  | Branch name                          | development            | No       |
| `LOG_LEVEL`               | Logging level (info/debug/error)     | info                   | No       |
| `DATABASE_URL`            | PostgreSQL connection string         | -                      | Yes      |
| `APIKEY`                  | API key for request authentication   | -                      | Yes      |
| `JWT_ACCESS_SECRET`       | Secret key for access tokens         | -                      | Yes      |
| `JWT_REFRESH_SECRET`      | Secret key for refresh tokens        | -                      | Yes      |
| `JWT_ACCESS_EXPIRES`      | Access token expiration              | 60m                    | No       |
| `JWT_REFRESH_EXPIRES`     | Refresh token expiration             | 7d                     | No       |
| `KEY_SECRET`              | Encryption key (32 characters)       | -                      | Yes      |
| `REDIS_URL`               | Redis connection URL                 | redis://localhost:6379 | Yes      |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window              | 10                     | No       |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit time window (ms)          | 60000                  | No       |

---

## 📜 Available Scripts

| Script                    | Description                               |
| ------------------------- | ----------------------------------------- |
| `bun run dev`             | Start development server with auto-reload |
| `bun run build`           | Build TypeScript to JavaScript            |
| `bun run start`           | Start production server                   |
| `bun run prisma:migrate`  | Run database migrations                   |
| `bun run prisma:generate` | Generate Prisma Client                    |
| `bun run prisma:studio`   | Open Prisma Studio (database GUI)         |
| `bun run test`            | Run tests                                 |
| `bun run test:watch`      | Run tests in watch mode                   |
| `bun run test:coverage`   | Run tests with coverage report            |
| `bun run docker:build`    | Build Docker images                       |
| `bun run docker:up`       | Start Docker services                     |
| `bun run docker:down`     | Stop Docker services                      |
| `bun run docker:logs`     | View Docker logs                          |
| `bun run docker:migrate`  | Run migrations in Docker                  |
| `bun run docker:studio`   | Start Prisma Studio in Docker             |
| `bun run docker:clean`    | Remove Docker volumes and containers      |

---

## 🧪 Functional Testing

The project includes functional test scripts located in `src/tests/functionals/`.

### Test Files

#### 1. Rate Limiting Test (`test-rate-limit-simple.js`)

Tests the rate limiting and queue system without authentication.

```bash
# Start the backend first
bun run dev

# In another terminal, run the test
node src/tests/functionals/test-rate-limit-simple.js
```

**What it tests:**

- Rate limit enforcement (10 requests per 60 seconds)
- Queue system when rate limit exceeded
- 202 Accepted responses with queue tokens
- Queue position and estimated wait time
- Queue status polling
- Request processing by queue worker

**Expected Results:**

- First 10 requests: 200 OK (processed immediately)
- Requests 11-15: 202 Accepted (queued)
- Queued requests processed within seconds

#### 2. Full Rate Limiting Test (`test-rate-limit.js`)

Comprehensive rate limiting test with user authentication.

```bash
node src/tests/functionals/test-rate-limit.js
```

**What it tests:**

- User registration and login
- Authenticated rate limiting
- Normal requests under rate limit
- Queue behavior when exceeding limits
- Queue depth tracking

#### 3. Swagger Documentation Test (`test-swagger.js`)

Validates that the Swagger documentation is properly generated.

```bash
node src/tests/functionals/test-swagger.js
```

**What it tests:**

- Swagger endpoint accessibility
- API documentation generation
- Endpoint definitions

### Running All Tests

```bash
# Start Redis and PostgreSQL
docker-compose up -d redis postgres

# Start the backend
bun run dev

# In another terminal, run tests
node src/tests/functionals/test-rate-limit-simple.js
node src/tests/functionals/test-swagger.js
```

### Test Output Example

```yaml
🚀 Starting Rate Limit and Queue Tests

Configuration:
  Rate Limit: 10 requests per 60 seconds
  Base URL: http://localhost:3131/api/v1
  Endpoint: GET /products

📊 Results after 0.06s:
  ✅ Normal requests (200): 10
  ⏳ Queued requests (202): 5
  ❌ Errored requests: 0

⏳ Queued Request #10:
   Queue Token: 719bfd7d-84bd-4e0f-9076-d12b7fa6d862
   Position: 1/5
   Estimated Wait: 2s
```

---

## 🔒 Security Features

- **API Key Authentication**: All requests must include valid API key in headers
- **Security Headers Validation**: Enforced security headers on all requests
  - `x-content-type-options: nosniff` - Prevents MIME type sniffing
  - `x-xss-protection: 1; mode=block` - Enables XSS protection
  - `strict-transport-security: max-age=31536000; includeSubDomains; preload` - Enforces HTTPS
  - `x-frame-options: SAMEORIGIN` - Prevents clickjacking

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Helmet**: Security headers to protect against common vulnerabilities
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Data Encryption**: AES-256-CBC encryption for sensitive data
- **Request Validation**: Input validation using Joi/Zod
- **Error Handling**: Centralized error handler that doesn't leak sensitive information
- **Rate Limiting**: Redis-based rate limiting with queue system

See [Required Security Headers](#-required-security-headers) section for implementation details.

---

## 📝 License

This project is private and proprietary.

---
