import { createClient } from "@supabase/supabase-js";

// Default values as fallbacks for production
const DEFAULT_SUPABASE_URL = "https://vznnpdwqmdisgjguujos.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bm5wZHdxbWRpc2dqZ3V1am9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5MjI0MTQsImV4cCI6MjA1NDQ5ODQxNH0.S2xs4yLSDGpcSmREse-1i8DGnn9EQdYuIH4KJuYvlTo";

// Try to get from import.meta.env, fall back to defaults if not available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Log the values for debugging (replace with console.log in development if needed)
console.log('Using Supabase URL:', supabaseUrl);
console.log('Using Supabase Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'missing');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);