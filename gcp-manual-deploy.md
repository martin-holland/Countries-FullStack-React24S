# Manual Deployment to Google Cloud Run

This guide provides step-by-step instructions for manually deploying the Countries Full-Stack application to Google Cloud Run.

## Prerequisites

1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Install Docker: https://docs.docker.com/get-docker/

## Setup Steps

### 1. Authentication

```bash
# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID
```

### 2. Enable Required Services

```bash
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com
```

### 3. Build the Docker Image

```bash
# Build the image locally
docker build -t gcr.io/YOUR_PROJECT_ID/countries-app:latest .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/countries-app:latest
```

### 4. Deploy to Cloud Run

```bash
gcloud run deploy countries-app \
  --image gcr.io/YOUR_PROJECT_ID/countries-app:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```

### 5. Set Environment Variables

Either set them during deployment:

```bash
gcloud run deploy countries-app \
  --image gcr.io/YOUR_PROJECT_ID/countries-app:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,SUPABASE_URL=your_supabase_url,SUPABASE_KEY=your_supabase_key
```

Or update them separately:

```bash
gcloud run services update countries-app \
  --region us-central1 \
  --set-env-vars NODE_ENV=production,SUPABASE_URL=your_supabase_url,SUPABASE_KEY=your_supabase_key
```

### 6. View Your Deployed Service

```bash
# Get the URL of your deployed service
gcloud run services describe countries-app --region us-central1 --format="value(status.url)"
```

## Monitoring and Debugging

### View Logs

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=countries-app" --limit 10
```

### Check Service Status

```bash
gcloud run services describe countries-app --region us-central1
```

## Domain Mapping

To map a custom domain to your Cloud Run service:

1. Verify domain ownership in Google Cloud Console
2. Map the domain:

```bash
gcloud beta run domain-mappings create \
  --service countries-app \
  --domain your-domain.com \
  --region us-central1
```

3. Add the DNS records shown in the command output to your domain registrar

## Scaling Configuration

```bash
# Set maximum instances to control cost
gcloud run services update countries-app \
  --region us-central1 \
  --max-instances=10

# Set minimum instances to avoid cold starts
gcloud run services update countries-app \
  --region us-central1 \
  --min-instances=1
```
