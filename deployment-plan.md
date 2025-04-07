# Deployment Plan for Countries Full-Stack Application

## Project Overview

This project is a full-stack application with:

- React frontend (TypeScript, Vite, Redux Toolkit, Material UI)
- NestJS backend (TypeScript, RESTful API)
- Supabase for authentication and data storage

## General Considerations

### Environment Variables

- Supabase credentials (URL, API key)
- Database connection strings
- JWT secrets
- Port configurations
- CORS settings for each environment

### Build Process

The current root package.json has combined build commands:

- Frontend: `tsc -b && vite build`
- Backend: `nest build`
- Combined: `npm run build` (runs both)

### Backend-Frontend Integration Options

1. **Monolithic Deployment**: Backend serves frontend static files
2. **Separate Deployments**: Independent frontend and backend hosting

## Deployment Strategies

### 1. Heroku Deployment

**Approach**: Monolithic deployment

**Configuration Steps**:

1. Create a `Procfile` in the project root:

   ```
   web: cd backend && npm run start:prod
   ```

2. Add a postinstall script to root `package.json`:

   ```json
   "scripts": {
     "postinstall": "npm run install:all && npm run build"
   }
   ```

3. Modify backend to correctly serve frontend static files:

   ```typescript
   // in backend/src/main.ts
   app.useStaticAssets(join(__dirname, "..", "..", "frontend", "dist"));
   ```

4. Set up environment variables in Heroku dashboard:

   - SUPABASE_URL
   - SUPABASE_KEY
   - NODE_ENV=production

5. Connect GitHub repository to Heroku for CI/CD:

   - Automatic deploys from main branch
   - Enable review apps for pull requests

6. Scale dynos appropriately:
   - Web: 1x for standard usage
   - Consider performance add-ons for production

**Pros**:

- Simplified deployment management (single platform)
- Shared environment variables
- No cross-origin issues between frontend and backend
- Native support for long-running processes (suitable for NestJS)
- Easy horizontal scaling with additional dynos

**Cons**:

- Higher cost for combined resources
- Single point of failure
- Less flexibility in technology choices
- Cannot optimize frontend and backend separately
- Potential resource contention between frontend and backend

### 2. Vercel Deployment

**Approach**: Separate deployments (frontend on Vercel, backend elsewhere)

**Frontend Deployment**:

1. Create `vercel.json` in the frontend directory:

   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://your-backend-url/api/$1"
       },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

2. Set up environment variables in Vercel dashboard:

   - VITE_API_URL=https://your-backend-url
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

3. Connect GitHub repository to Vercel:

   - Set root directory to `/frontend`
   - Configure build command: `npm run build`
   - Configure output directory: `dist`

4. Set up production domain and configure custom domains if needed

**Backend Deployment**:

- Deploy backend separately on Heroku or other service
- Configure CORS to allow requests from Vercel frontend domain:
  ```typescript
  app.enableCors({
    origin: ["https://your-frontend-domain.vercel.app"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });
  ```

**NestJS on Vercel Option**:

You can also deploy NestJS directly on Vercel by adapting it to work as serverless functions:

1. Create `vercel.json` in backend directory:

   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/main.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/main.ts"
       }
     ]
   }
   ```

2. Modify NestJS main.ts to handle serverless execution:

   ```typescript
   // Conditional bootstrapping for Vercel
   if (process.env.NODE_ENV !== "vercel") {
     bootstrap();
   }
   export default bootstrap; // For serverless execution
   ```

3. Create API handlers in /api directory that forward requests to your NestJS application

**Pros of Vercel for Frontend**:

- Excellent performance for static sites
- Global CDN with edge caching
- Automatic HTTPS
- Preview deployments for pull requests
- Free tier for personal projects
- Built-in analytics

**Cons of Vercel for Frontend**:

- Limited customization compared to self-hosted solutions
- Vendor lock-in concerns
- Potential costs at scale

**Pros of NestJS on Vercel**:

- Single platform management for both frontend and backend
- Seamless API integration
- Free tier available
- Easy CI/CD integration with GitHub

**Cons of NestJS on Vercel**:

- Cold starts on serverless functions (performance impact)
- 30-second execution limit (free tier)
- Not ideal for long-running processes (NestJS design)
- Stateless architecture (challenges with WebSockets, session management)
- Limited to 50MB total deployment size
- Memory limited to 1GB on free plan
- Database connection management challenges in serverless environment

### 3. Google Cloud Platform Deployment

**Approach**: Container-based deployment with Cloud Run

**Setup Steps**:

1. Create `Dockerfile` in project root:

   ```dockerfile
   FROM node:18 AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM node:18-slim
   WORKDIR /app
   COPY --from=builder /app/backend/dist ./backend/dist
   COPY --from=builder /app/frontend/dist ./frontend/dist
   COPY --from=builder /app/backend/package*.json ./backend/
   COPY --from=builder /app/package*.json ./
   RUN npm install --only=production
   CMD ["npm", "run", "start:backend:prod"]
   ```

2. Add a production start script to root `package.json`:

   ```json
   "start:backend:prod": "cd backend && npm run start:prod"
   ```

3. Set up Google Cloud Build:

   - Create `cloudbuild.yaml` for build configuration
   - Configure triggers to build on commits to main branch

4. Deploy to Cloud Run:

   - Set memory and CPU allocations based on application needs
   - Configure environment variables
   - Set up domain mapping

5. Implement Cloud Monitoring for observability

**Pros**:

- Flexible container-based deployment
- Automatic scaling based on demand
- Pay-per-use pricing model
- Full control over runtime environment
- Strong support for microservices architecture
- Managed service (no infrastructure management)
- Ideal for NestJS applications (supports long-running processes)

**Cons**:

- More complex setup than Vercel or Heroku
- Higher learning curve
- Potential for higher costs at scale
- Requires container knowledge
- Additional configuration for frontend optimization (compared to Vercel)

## CI/CD Implementation

### GitHub Actions Workflow

Create `.github/workflows/deployment.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm run install:all
      - run: cd frontend && npm run lint
      - run: cd backend && npm run lint
      # Add test runs when available

  deploy-dev:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      # Development environment deployment steps

  deploy-prod:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      # Production environment deployment steps
```

## Comparison of Deployment Options

| Feature                     | Heroku             | Vercel (Frontend) | Vercel (Backend) | Google Cloud Run      |
| --------------------------- | ------------------ | ----------------- | ---------------- | --------------------- |
| Free Tier                   | Limited (Eco plan) | Generous          | Generous         | Free tier with limits |
| Cold Start                  | Minimal            | None for frontend | Yes (5-10s)      | Yes (1-2s)            |
| Scaling                     | Manual/Auto        | Automatic         | Automatic        | Automatic             |
| NestJS Compatibility        | Excellent          | N/A               | Limited          | Excellent             |
| WebSockets                  | Supported          | N/A               | Limited          | Supported             |
| Setup Complexity            | Medium             | Low               | Medium-High      | High                  |
| Long-running Tasks          | Supported          | N/A               | Not supported    | Supported             |
| Execution Time Limit        | None               | N/A               | 30s (free)       | 15min                 |
| Database Connection Pooling | Supported          | N/A               | Challenging      | Supported             |

## Recommendation

**Recommended Approach**: Separate frontend and backend deployments

**Benefits**:

1. **Independent Scaling**: Each service can scale based on its own requirements
2. **Specialized Hosting**: Frontend on Vercel for optimal static file serving, backend on platform optimized for Node.js
3. **Isolated Testing & Debugging**: Issues are contained to specific components
4. **Flexible Development**: Teams can work independently on frontend and backend
5. **Cost Optimization**: Resources can be allocated efficiently based on actual usage

**Implementation Path**:

1. Development: Use concurrent setup with local environment
2. Staging: Deploy frontend to Vercel, backend to Heroku
3. Production: Deploy frontend to Vercel, backend to GCP Cloud Run

**Best Option for NestJS Backend**:
For a NestJS application, Google Cloud Run or Heroku provide better runtime environments than Vercel's serverless functions due to NestJS's design for long-running processes and stateful operation.

## Next Steps

1. Create environment-specific configuration files
2. Set up CI/CD pipelines for automated testing and deployment
3. Implement monitoring and logging solutions
4. Document deployment procedures for team reference
5. Plan for database migrations and version compatibility
