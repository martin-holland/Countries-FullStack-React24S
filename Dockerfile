# Build stage
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci
RUN npm run install:all

# Copy source code
COPY . .

# Build both frontend and backend
RUN npm run build

# Production stage
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/package*.json ./

# Install production dependencies only
WORKDIR /app/backend
RUN npm ci --only=production

# Set working directory back to root
WORKDIR /app

# Add production start script to package.json if it doesn't exist
RUN if ! grep -q "start:prod" package.json; then \
    sed -i 's/"scripts": {/"scripts": {\n    "start:prod": "cd backend \&\& npm run start:prod",/g' package.json; \
    fi

# Expose port
ENV PORT=8080
EXPOSE 8080

# Start the application
CMD ["npm", "run", "start:prod"] 