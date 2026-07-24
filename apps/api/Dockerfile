# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.2 --activate

# Copy root configurations
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./

# Copy the API and database packages
COPY apps/api ./apps/api
COPY packages/database ./packages/database

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN cd packages/database && npx prisma generate

# Build the API using turbo
RUN pnpm turbo run build --filter=api...

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.2 --activate

# Copy root configs
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy built artifacts and dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# Expose API port
EXPOSE 3001

# Start the application
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
