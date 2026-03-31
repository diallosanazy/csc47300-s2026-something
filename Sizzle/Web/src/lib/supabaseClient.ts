import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

function getRequiredEnv(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY') {
  const value = import.meta.env[name] as string | undefined;
  if (!value) throw new Error(`Missing ${name}. Add it to your .env.local (see .env.example).`);
  return value;
}

export const supabase = createClient<Database>(getRequiredEnv('VITE_SUPABASE_URL'), getRequiredEnv('VITE_SUPABASE_ANON_KEY'));

