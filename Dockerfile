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

# Debug: Print build-time environment variables
RUN echo "===== DEBUG: BUILD-TIME ENVIRONMENT VARIABLES =====" && \
    echo "VITE_SUPABASE_URL: $VITE_SUPABASE_URL" && \
    echo "VITE_SUPABASE_ANON_KEY: $VITE_SUPABASE_ANON_KEY" && \
    echo "VITE_OPENWEATHER_API_KEY: $VITE_OPENWEATHER_API_KEY" && \
    echo "=================================================="

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install all dependencies (including dev dependencies needed for build)
RUN npm install
RUN npm run install:all

# Create production environment files with default values
RUN echo "VITE_SUPABASE_URL=https://vznnpdwqmdisgjguujos.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bm5wZHdxbWRpc2dqZ3V1am9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5MjI0MTQsImV4cCI6MjA1NDQ5ODQxNH0.S2xs4yLSDGpcSmREse-1i8DGnn9EQdYuIH4KJuYvlTo\nVITE_OPENWEATHER_API_KEY=c3cb87f69a79390fb71062c4fa9f0209" > /app/frontend/.env.production

# Copy source code
COPY . .

# Build both frontend and backend
# Vite will now pick up the VITE_ env vars during its build
RUN npm run build

# Production stage - SIMPLIFIED APPROACH
FROM node:18-slim

# Set working directory
WORKDIR /app

# Set runtime environment variables for backend (temporary for debugging)
ENV SUPABASE_URL="https://vznnpdwqmdisgjguujos.supabase.co"
ENV SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bm5wZHdxbWRpc2dqZ3V1am9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5MjI0MTQsImV4cCI6MjA1NDQ5ODQxNH0.S2xs4yLSDGpcSmREse-1i8DGnn9EQdYuIH4KJuYvlTo"
ENV NODE_ENV="production"

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

# Create a wrapper script to print environment variables at runtime
RUN echo '#!/bin/bash\n\
    echo "===== DEBUG: RUNTIME ENVIRONMENT VARIABLES ====="\n\
    echo "NODE_ENV: $NODE_ENV"\n\
    echo "PORT: $PORT"\n\
    echo "SUPABASE_URL: $SUPABASE_URL"\n\
    echo "SUPABASE_ANON_KEY: $SUPABASE_ANON_KEY"\n\
    echo "FRONTEND_URL: $FRONTEND_URL"\n\
    echo "================================================"\n\
    node backend/dist/main.js\n' > /app/start.sh && chmod +x /app/start.sh

# Use the wrapper script to start the app
CMD ["/app/start.sh"] 