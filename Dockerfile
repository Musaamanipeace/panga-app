# Multi-stage Dockerfile for Fly.io deployment
FROM node:22-slim AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy application source code
COPY . .

# Build the frontend bundle and type check
RUN npm run build

# Production runtime stage
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy package descriptors and install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server code and prebuilt static frontend
COPY server.ts ./
COPY --from=builder /app/dist ./dist

# Use unprivileged node user
USER node

EXPOSE 8080

CMD ["node", "server.ts"]
