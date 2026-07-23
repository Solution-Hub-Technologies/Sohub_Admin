import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bvjgogntjsrzamskscbg.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2amdvZ250anNyemFtc2tzY2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MTIwMDAsImV4cCI6MjA5MTk4ODAwMH0.atVHydEdYQGDZDO47HaxgU1kctdGr1_5p3jI8SzRF3o';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'sohub_admin' }
});

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { data, error } = await supabase
      .from('addons')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      // Fallback to public schema
      const publicSupabase = createClient(supabaseUrl, supabaseAnonKey);
      const publicRes = await publicSupabase
        .from('addons')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
        
      return res.status(200).json(publicRes.data || []);
    }

    return res.status(200).json(data || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
