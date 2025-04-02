import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './controllers/app.controller';
import { ProtectedDataController } from './controllers/protected-data.controller';
import { TestController } from './controllers/test.controller';
import { AuthMiddleware } from './middleware/auth.middleware';
import { AppService } from './services/app.service';
import { SupabaseService } from './services/supabase.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, TestController, ProtectedDataController],
  providers: [AppService, SupabaseService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(ProtectedDataController);
  }
}
