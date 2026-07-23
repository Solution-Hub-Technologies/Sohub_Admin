import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'sohub_admin',
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseAnonKey);

export const clearAllSupabaseTables = async () => {
  try {
    await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('addons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('chassis').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('All demo data cleared from Supabase sohub_admin schema.');
  } catch (err) {
    console.warn('Error clearing Supabase tables:', err);
  }
};
