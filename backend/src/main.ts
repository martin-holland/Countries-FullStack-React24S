import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

// Debug function to print environment variables
function logEnvironmentVariables() {
  console.log('===== DEBUG: NESTJS ENVIRONMENT VARIABLES =====');
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`PORT: ${process.env.PORT}`);
  console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL}`);
  // Only print the first few characters of sensitive values
  const anonKey = process.env.SUPABASE_ANON_KEY || '';
  console.log(`SUPABASE_ANON_KEY: ${anonKey.substring(0, 10)}...`);
  console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
  console.log('==============================================');
}

async function bootstrap() {
  // Log environment variables for debugging
  logEnvironmentVariables();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Only serve static files in non-serverless environments
  if (process.env.NODE_ENV !== 'vercel') {
    app.useStaticAssets(join(__dirname, '..', '..', 'frontend', 'dist'));
    app.setBaseViewsDir(join(__dirname, '..', '..', 'frontend', 'dist'));
  }

  // Enable CORS for React development
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL || 'https://your-frontend-domain.com']
        : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.init();

  // Listen for connections when not on Vercel
  if (process.env.NODE_ENV !== 'vercel') {
    // Cloud Run will set PORT environment variable
    const port = process.env.PORT || 5001;
    await app.listen(port);
    console.log(`Application is running on port ${port}`);
  }

  return app;
}

// For local development
if (process.env.NODE_ENV !== 'vercel') {
  bootstrap();
}

// For Vercel serverless deployment
export default bootstrap;
