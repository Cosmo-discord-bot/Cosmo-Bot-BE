FROM node:18-alpine

# Install necessary packages
RUN apk add --no-cache docker-cli bash

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# We don't need to copy anything here as the entire project will be mounted

# Install dependencies (this will use the package.json from the mounted project)
CMD ["pnpm", "install"]