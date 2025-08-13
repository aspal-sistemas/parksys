# Dockerfile for deployment compatibility
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 5000

# Health check for deployment platforms
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/healthz || exit 1

# Start the server
CMD ["npm", "start"]