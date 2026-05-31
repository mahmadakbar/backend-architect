# Use Bun as the base image
FROM oven/bun:1 AS base
WORKDIR /app

# Install OpenSSL (required by Prisma) and curl (for healthcheck)
RUN apt-get update -y && apt-get install -y openssl ca-certificates curl && rm -rf /var/lib/apt/lists/*

# Install dependencies
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Production image - Run TypeScript directly with Bun
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src

# Generate Prisma Client
RUN bunx prisma generate --schema=./src/prisma/schema.prisma

# Expose the port
EXPOSE 3131

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run -e "fetch('http://localhost:3131').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the application directly with Bun (no build needed)
CMD ["bun", "run", "src/app.ts"]
