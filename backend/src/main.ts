import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
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
