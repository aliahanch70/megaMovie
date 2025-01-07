import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const createClient = () => {
  if (typeof window === 'undefined') {
    // Server-side - use native client with service role key for static generation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required Supabase environment variables for static generation');
    }
    
    return createSupabaseClient<Database>(supabaseUrl, supabaseKey);
  }
  
  // Client-side - use Next.js auth helper
  return createClientComponentClient<Database>();
};