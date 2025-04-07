# Build stage
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# ---> ADD THESE ARG LINES <---
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_OPENWEATHER_API_KEY

# ---> ADD THESE ENV LINES <---
# Make ARGs available as ENV variables for the build process (Vite reads these)
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_OPENWEATHER_API_KEY=$VITE_OPENWEATHER_API_KEY

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install all dependencies (including dev dependencies needed for build)
RUN npm install
RUN npm run install:all

# Copy source code
COPY . .

# Build both frontend and backend
# Vite will now pick up the VITE_ env vars during its build
RUN npm run build

# Production stage - SIMPLIFIED APPROACH
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

# Install only production dependencies in the backend
WORKDIR /app/backend
RUN npm install --omit=dev

# Create a simple start script in the root
WORKDIR /app
RUN echo '{"scripts":{"start":"cd backend && node dist/main.js"}}' > start-package.json

# Set environment variable
ENV PORT=8080
EXPOSE 8080

# Use a direct command to start the app
CMD ["node", "backend/dist/main.js"] 