import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bvjgogntjsrzamskscbg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2amdvZ250anNyemFtc2tzY2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MTIwMDAsImV4cCI6MjA5MTk4ODAwMH0.atVHydEdYQGDZDO47HaxgU1kctdGr1_5p3jI8SzRF3o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'sohub_admin',
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isSupabaseConfigured = () => true;

// Helper to clear all records from Supabase sohub_admin tables
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
