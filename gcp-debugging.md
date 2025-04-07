# Debugging Google Cloud Run Deployments

This guide provides solutions for common issues you might encounter when deploying to Google Cloud Run.

## Common Issues and Solutions

### 1. Container Fails to Start

**Symptoms:**

- Service deployment succeeds but you see a "container failed to start" error
- 500 errors when accessing the service

**Possible Causes and Solutions:**

1. **Port Configuration:**

   - Ensure your application listens on the port specified by the `PORT` environment variable:

   ```javascript
   const port = process.env.PORT || 8080;
   app.listen(port);
   ```

2. **Startup Timeout:**

   - Cloud Run gives containers 4 minutes to start. Ensure initialization completes within this time.
   - Consider moving heavy initialization to lazy loading patterns.

3. **Memory Limits:**
   - Increase memory allocation if your app needs more resources:
   ```bash
   gcloud run services update countries-app --memory 512Mi
   ```

### 2. Environment Variables Missing

**Symptoms:**

- Authentication errors to external services
- Application fails with "cannot read property of undefined" errors

**Solutions:**

- Check if environment variables are set correctly:
  ```bash
  gcloud run services describe countries-app --format="yaml(spec.template.spec.containers[0].env)"
  ```
- Update environment variables if needed:
  ```bash
  gcloud run services update countries-app --set-env-vars KEY=VALUE
  ```

### 3. CORS Issues

**Symptoms:**

- Frontend API calls fail with CORS errors in browser console

**Solutions:**

- Ensure your NestJS backend has proper CORS configuration:
  ```typescript
  app.enableCors({
    origin: ["https://your-frontend-domain.com"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });
  ```
- For separate frontend/backend deployments, add your frontend domain to the allowed origins.

### 4. Cold Start Latency

**Symptoms:**

- First request after inactivity is slow (several seconds)

**Solutions:**

- Set minimum instances to keep at least one instance warm:
  ```bash
  gcloud run services update countries-app --min-instances=1
  ```
- Optimize your container startup time by minimizing dependencies and using production builds.

### 5. Database Connection Issues

**Symptoms:**

- Database connection errors in logs
- Application errors related to database operations

**Solutions:**

- For Supabase, check if your IP is allowlisted (if using IP restrictions)
- Ensure connection pooling is properly configured for serverless environments:
  ```typescript
  // Use connection pooling with limits
  const pool = new Pool({
    max: 10, // Maximum connections
    idleTimeoutMillis: 30000,
  });
  ```

### 6. Container Image Push Failures

**Symptoms:**

- `docker push` command fails with authentication errors

**Solutions:**

- Ensure you're authenticated with Google Cloud:
  ```bash
  gcloud auth login
  gcloud auth configure-docker
  ```
- Check if you have proper permissions on the project and repository.

### 7. Memory Leaks

**Symptoms:**

- Container crashes after running for some time
- Increasing memory usage over time

**Solutions:**

- Monitor memory usage in Cloud Monitoring
- Look for common memory leak sources in Node.js (event listeners, caches, etc.)
- Implement proper cleanup in your application code

## Viewing Logs

Logs are crucial for debugging. Access them with:

```bash
# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=countries-app" --limit 20

# Stream logs in real-time
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=countries-app" --stream

# Filter for error logs only
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=countries-app AND severity>=ERROR"
```

## Checking Service Health

```bash
# Get service details
gcloud run services describe countries-app --region us-central1

# List revisions to see deployment history
gcloud run revisions list --service countries-app --region us-central1
```

## Rollback to Previous Version

If a deployment introduces problems, roll back to a previous working revision:

```bash
# List revisions
gcloud run revisions list --service countries-app --region us-central1

# Roll back to a specific revision
gcloud run services update-traffic countries-app --to-revisions=REVISION_NAME=100 --region us-central1
```
