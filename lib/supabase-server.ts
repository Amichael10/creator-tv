import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
      console.warn('[CreatorTV Server] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    // Return a dummy client during build/static evaluation to prevent crashes
    return createClient(
      supabaseUrl || 'https://placeholder-project.supabase.co',
      supabaseServiceKey || 'placeholder-anon-or-service-role-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _supabaseAdmin;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    const val = (client as any)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});

