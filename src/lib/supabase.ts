// Supabase client for both browser and server (Astro/Cloudflare)

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Check .env.local');
}

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Browser/client-side client (uses anon key)
let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }

  browserClient = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}

// Server/admin client (uses service role key - only for server-side!)
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!isSupabaseConfigured() || !supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
  }

  return createClient<Database>(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// For Cloudflare Workers/Pages Functions (edge runtime)
export function createSupabaseClient(
  url: string,
  anonKey: string,
  options?: { serviceKey?: string }
): SupabaseClient<Database> {
  return createClient<Database>(url, options?.serviceKey || anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}