# Build arguments
ARG NODE_ENV=production
ARG PORT=4000

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm install

# Copy source code and config
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies based on NODE_ENV
RUN if [ "$NODE_ENV" = "production" ]; then \
        npm ci --only=production; \
    else \
        npm install; \
    fi

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy source files for development
COPY src ./src
COPY tsconfig.json ./

# Expose port
EXPOSE ${PORT}

# Start command based on NODE_ENV
CMD if [ "$NODE_ENV" = "production" ]; then \
        node dist/server.js; \
    else \
        npm run dev; \
    fi 