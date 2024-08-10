# Stage 1: Build Stage
FROM node:18-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

COPY . .

RUN pnpm install && \
    pnpm run build

# Stage 2: Production Stage
FROM node:18-alpine AS production

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build

# Set environment variables (optional)
ENV NODE_ENV=production

# Expose the port your app runs on (adjust if necessary)
EXPOSE 8083

# Command to run the bot
CMD ["pnpm", "run", "start"]