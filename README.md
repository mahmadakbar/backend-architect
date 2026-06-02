# 📝 E-Commerce Application

A full-stack E-Commerce application built with Next.js, Express.js, and PostgreSQL.

## 🚀 Features

- ✨ User authentication (Register/Login)
- 📋 Task creation, editing, and deletion
- ✅ Task status management
- 📅 Task deadlines
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 🔐 JWT-based authentication
- 📱 Responsive design
- 📊 **OpenTelemetry integration** - Distributed tracing, metrics, and log correlation
- 🔍 **Jaeger UI** - Visual trace exploration and debugging
- ⏱️ **Rate Limiting with Queue System** - UX-friendly rate limiting that returns 202 Accepted with queue tokens
- 🔌 **Socket.IO Real-time Updates** - Get instant notifications when queued requests complete
- 📦 **Redis-based Queue** - Reliable request queuing and processing

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Query** - Data fetching & caching
- **Zustand** - State management

### Backend

- **Express.js** - Node.js framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Swagger** - API documentation
- **Bun** - Runtime & package manager
- **Pino** - Structured logging
- **OpenTelemetry** - Observability & distributed tracing
- **Redis** - Queue management & rate limiting
- **Socket.IO** - Real-time bidirectional communication
- **BullMQ** - Async job processing with retry & dead letter queue
- **Nodemailer** - Email service for transactional emails (Gmail SMTP)

## 📦 Project Structure

```ini
task-management/
├── frontend/          # Next.js frontend application
├── backend/           # Express.js backend API
├── docker-compose.yml # Docker orchestration
└── README.md          # This file
```

## 🐳 Quick Start with Docker (Recommended)

### Prerequisites

- Docker Desktop installed
- Docker Compose (included with Docker Desktop)

### 1. Setup Environment

```bash
# Copy environment template
cp .env.example .env
```

Generate secure secrets:

```bash
openssl rand -base64 32  # For JWT_ACCESS_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
openssl rand -base64 24  # For KEY_SECRET
```

Edit `.env` and add the generated values.

### 2. Start Application

```bash
docker-compose up -d
```

This starts:

- PostgreSQL Database on port 5432
- Redis Cache & Queue on port 6379
- Backend API on port 3131
- Frontend Application on port 3000

### 3. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3131
- **API Documentation**: http://localhost:3131/api-docs

### Common Docker Compose Commands

```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f            # View all logs
docker-compose logs -f backend    # View backend logs only
docker-compose ps                 # Check service status
docker-compose restart            # Restart all services
docker-compose up -d --build      # Rebuild and start
docker-compose down -v            # Remove everything including data
```

## 📊 OpenTelemetry & Observability (Optional)

### Using Jaeger

1. **Make API requests** to your backend
2. **Open Jaeger UI** at http://localhost:16686
3. **Select service**: `ecommerce-backend`
4. **View traces**: See request flows, timing, and performance
5. __Debug issues__: Use trace_id from logs to find specific requests

### Features

- 🔍 **Distributed Tracing**: Track requests across services
- 📊 **Performance Metrics**: Monitor application performance
- 🔗 __Log Correlation__: All logs include trace_id for easy debugging
- 🎯 **Automatic Instrumentation**: HTTP, Express, Prisma automatically traced
- 🐛 **Error Tracking**: Exceptions and errors linked to traces

```bash
# 1. Add to your .env file
TELEMETRY_ENABLED=true

# 2. Start Jaeger for trace visualization
docker-compose --profile monitoring up -d

# 3. Access Jaeger UI
open http://localhost:16686
```

### Enable OpenTelemetry Tracing

The application includes OpenTelemetry for distributed tracing, metrics, and log correlation. This helps you understand request flows, identify bottlenecks, and debug issues in production.

## 💻 Local Development (Without Docker)

### Backend Setup

```bash
cd backend
bun install
cp .env.example .env
# Edit .env with your configuration
bun run prisma:migrate
bun run dev
```

Backend runs on http://localhost:3131

### Frontend Setup

```bash
cd frontend
bun install
cp .env.example .env
# Edit .env with your configuration
bun run dev
```

Frontend runs on http://localhost:3000

## 🧪 Testing the Application

Once the application is running, follow these steps to test the functionality:

### Step 0: Navigate to Registration

1. Open your browser and go to http://localhost:3000/login
2. Click on **"Don't have an account?"** link on the login page

### Step 1: Register a New Account

1. Fill in the registration form:

   - **Username**: Enter a unique username (3-50 characters)
   - **Name**: Enter your full name (2-100 characters)
   - **Password**: Enter a secure password (minimum 6 characters)
   - **Confirm Password**: Re-enter the same password

2. Click the **"Register"** button
3. You'll be automatically redirected to the login page upon successful registration

### Step 2: Login

1. Enter your registered **username**
2. Enter your **password**
3. Click the **"Login"** button
4. You'll be redirected to the task dashboard

### Step 3: Manage Your To-Do List

1. **Add a new task:**

   - Click the **"Add Task"** or **"+"** button
   - Enter the task **title**
   - Add a **description** (optional)
   - Set a **deadline** (optional)
   - Mark as completed if needed (checkbox)
   - Click **"Save"** to create the task

2. **Edit an existing task:**

   - Click the **"Edit"** button on any task
   - Modify the task details
   - Click **"Update"** to save changes

3. **Mark task as complete:**

   - Click the checkbox next to the task
   - The task status will be updated automatically

4. **Delete a task:**

   - Click the **"Delete"** button on any task
   - Confirm the deletion

### Step 4: Logout

- Click the logout button to end your session (not set yet)

## 📚 API Documentation

Interactive API documentation: http://localhost:3131/api-docs

### 🔐 Required Security Headers

**All API requests must include these headers:**

| Header | Value |
|--------|-------|
| `apikey` | Your API key from backend `.env` |
| `x-content-type-options` | `nosniff` |
| `x-xss-protection` | `1; mode=block` |
| `strict-transport-security` | `max-age=31536000; includeSubDomains; preload` |
| `x-frame-options` | `SAMEORIGIN` |

**Example:**

```bash
curl "http://localhost:3131/api/v1/products" \
  -H "apikey: your-api-key" \
  -H "x-content-type-options: nosniff" \
  -H "x-xss-protection: 1; mode=block" \
  -H "strict-transport-security: max-age=31536000; includeSubDomains; preload" \
  -H "x-frame-options: SAMEORIGIN"
```

### Main Endpoints

#### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token

#### Tasks

- `GET /api/v1/tasks` - Get all tasks
- `POST /api/v1/tasks` - Create task
- `POST /api/v1/tasks/update/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

## 🔐 Environment Variables

### Required Variables

| Variable | Description | How to Generate |
|----------|-------------|----------------|
| APIKEY | API authentication key | `openssl rand -base64 32` |
| JWT_ACCESS_SECRET | Access token secret | `openssl rand -base64 32` |
| JWT_REFRESH_SECRET | Refresh token secret | `openssl rand -base64 32` |
| KEY_SECRET | Encryption key | `openssl rand -base64 24` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| TELEMETRY_ENABLED | Enable OpenTelemetry tracing | `false` |
| TELEMETRY_SERVICE_NAME | Service name for tracing | `ecommerce-backend` |
| TELEMETRY_SERVICE_VERSION | Service version | `1.0.0` |
| TELEMETRY_OTLP_ENDPOINT | OpenTelemetry collector endpoint | `http://localhost:4318` |
| REDIS_URL | Redis connection URL | `redis://localhost:6379` |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | `10` |
| RATE_LIMIT_WINDOW_MS | Rate limit time window (ms) | `60000` (1 min) |

See `.env.example` files for all available options.

## 🗄️ Database Management

### Using Docker

```bash
# Run migrations
docker-compose exec backend bunx prisma migrate deploy --schema=./src/prisma/schema.prisma

# Access PostgreSQL shell
docker-compose exec postgres psql -U testtodo -d todo_postgres

# Backup database
docker-compose exec -T postgres pg_dump -U testtodo todo_postgres > backup.sql

# Restore database
docker-compose exec -T postgres psql -U testtodo todo_postgres < backup.sql

# Open Prisma Studio
docker-compose --profile tools up prisma-studio
# Visit http://localhost:5555
```

## 📸 Screenshots

See the `screenshots/` directory for application screenshots.

## 🐛 Troubleshooting

### Frontend Cannot Access Backend API in Docker

If you see API connection errors when running in Docker:

1. The frontend uses two different API URLs:

   - __Client-side__ (browser): `NEXT_PUBLIC_API_URL=http://localhost:3131/api`
   - __Server-side__ (Docker): `INTERNAL_API_URL=http://backend:3131/api`

2. These are automatically configured in `docker-compose.yml`
3. No manual changes needed - the environment utility handles this automatically

__Note__: In local development (without Docker), only `NEXT_PUBLIC_API_URL` is used.

### Port Already in Use

Change ports in `.env`:

```env
BACKEND_PORT=3132
FRONTEND_PORT=3001
DB_PORT=5433
```

### Database Connection Errors

```bash
docker-compose logs postgres  # Check database logs
docker-compose restart        # Restart services
```

### Reset Everything

```bash
docker-compose down -v        # Remove all containers and data
docker-compose up -d --build  # Start fresh
```

## 🧪 Testing

### Functional Tests

The backend includes functional test scripts in `backend/src/tests/functionals/`:

#### Rate Limiting Tests

Test the rate limiting and queue system:

```bash
# Start services
docker-compose up -d

# Run basic rate limit test (no auth required)
node backend/src/tests/functionals/test-rate-limit-simple.js

# Run full rate limit test (with authentication)
node backend/src/tests/functionals/test-rate-limit.js
```

**What gets tested:**

- ✅ Rate limit enforcement (10 requests per 60 seconds)
- ✅ Queue system for rate-limited requests
- ✅ 202 Accepted responses with queue tokens
- ✅ Real-time queue status updates
- ✅ Automatic request processing

**Expected output:**

```ini
🚀 Starting Rate Limit and Queue Tests

📊 Results:
  ✅ Normal requests (200): 10
  ⏳ Queued requests (202): 5
  ❌ Errored requests: 0
```

#### Swagger Tests

Verify API documentation:

```bash
node backend/src/tests/functionals/test-swagger.js
```

### Unit Tests

Run backend unit tests:

```bash
cd backend
bun test                    # Run all tests
bun test:watch             # Watch mode
bun test:coverage          # With coverage report
```

## 🚢 Deployment

### Docker Production

1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Use a reverse proxy (nginx/traefik) with SSL
4. Configure proper CORS settings
5. Use external PostgreSQL database (recommended)

## 👨‍💻 Author

Ahmad Akbar

---
