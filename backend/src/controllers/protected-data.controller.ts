import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { SupabaseService } from '../services/supabase.service';

@Controller('protected-data')
export class ProtectedDataController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  async getProtectedData(@Req() req: Request) {
    try {
      // Use the user from the request (added by AuthMiddleware)
      const user = req['user'];
      
      console.log(`[${new Date().toISOString()}] Protected endpoint called by user: ${user.id} (${user.email})`);
      
      // Fetch data from the protected_data table using the service method
      const data = await this.supabaseService.getProtectedData(user.id);
      
      console.log(`[${new Date().toISOString()}] Data retrieved for user ${user.id}: ${data.length} records`);
      
      // Log the actual data if needed (be careful with sensitive information)
      if (data.length > 0) {
        console.log(`[${new Date().toISOString()}] Sample data:`, JSON.stringify(data[0]));
      }

      return {
        status: 'success',
        data,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in protected endpoint:`, error.message);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}
