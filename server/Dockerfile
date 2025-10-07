FROM node:lts-slim AS builder

LABEL org.opencontainers.image.source=https://github.com/Chess-Arena/chess-arena
LABEL maintainer="Chess Arena Team"
LABEL description="Chess Arena Backend - Event-driven NestJS with WebSocket and BullMQ"

WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:lts-slim AS production

WORKDIR /usr/src/app

# Install production dependencies
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy built application
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma

# Create non-root user
RUN groupadd -r chessarena && useradd -r -g chessarena chessarena
RUN chown -R chessarena:chessarena /usr/src/app
USER chessarena

# Expose ports for API and WebSocket
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD [ "node", "dist/src/main"]