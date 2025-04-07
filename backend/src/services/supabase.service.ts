import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly _supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>(
      'https://vznnpdwqmdisgjguujos.supabase.co',
    );
    const key = this.configService.get<string>(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bm5wZHdxbWRpc2dqZ3V1am9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5MjI0MTQsImV4cCI6MjA1NDQ5ODQxNH0.S2xs4yLSDGpcSmREse-1i8DGnn9EQdYuIH4KJuYvlTo',
    );
    this._supabase = createClient(url, key);
  }

  get supabase() {
    return this._supabase;
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
}
