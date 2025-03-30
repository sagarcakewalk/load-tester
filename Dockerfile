# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

# Production stage
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV VCS_BRANCH=${VCS_BRANCH:-main}

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "dist/server.js"] 