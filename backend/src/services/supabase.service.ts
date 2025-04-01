import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly _supabase: SupabaseClient;
  private readonly _adminSupabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_ANON_KEY');
    this._supabase = createClient(url, key);

    // Create a second client with the service role key for admin operations
    const serviceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    this._adminSupabase = createClient(url, serviceRoleKey);
  }

  get supabase() {
    return this._supabase;
  }

  get adminSupabase() {
    return this._adminSupabase;
  }

  async getUsers() {
    const { data, error } = await this.supabase.from('users').select('*');
    if (error) throw error;
    return data;
  }

  async addUser(user: { name: string; email: string }) {
    const { data, error } = await this.supabase.from('users').insert(user);
    if (error) throw error;
    return data;
  }

  async getProtectedData(userId: string) {
    console.log(
      `[${new Date().toISOString()}] Fetching protected data for user: ${userId}`,
    );

    const { data, error } = await this.adminSupabase
      .from('protected_data')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error(
        `[${new Date().toISOString()}] Error fetching data:`,
        error.message,
      );
      throw error;
    }

    console.log(
      `[${new Date().toISOString()}] Successfully retrieved ${data.length} records for user: ${userId}`,
    );
    return data;
  }
}
