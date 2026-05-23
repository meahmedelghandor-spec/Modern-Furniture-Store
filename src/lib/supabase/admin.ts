import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Server-only admin client that bypasses RLS
// Never expose this on the client side
export const adminSupabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
