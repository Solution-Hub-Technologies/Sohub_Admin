import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bvjgogntjsrzamskscbg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2amdvZ250anNyemFtc2tzY2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MTIwMDAsImV4cCI6MjA5MTk4ODAwMH0.atVHydEdYQGDZDO47HaxgU1kctdGr1_5p3jI8SzRF3o';

// Primary Client (sohub_admin schema)
export const supabaseAdminSchema = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'sohub_admin' },
  auth: { persistSession: true, autoRefreshToken: true },
});

// Fallback Client (public schema)
export const supabasePublicSchema = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// Smart Wrapper to try sohub_admin first, and fallback to public if 406/Schema Not Exposed occurs
export const supabase = new Proxy(supabaseAdminSchema, {
  get(target, prop) {
    if (prop === 'from') {
      return (tableName: string) => {
        const adminQuery = supabaseAdminSchema.from(tableName);
        const originalSelect = adminQuery.select.bind(adminQuery);
        const originalInsert = adminQuery.insert.bind(adminQuery);
        const originalUpdate = adminQuery.update.bind(adminQuery);
        const originalUpsert = adminQuery.upsert.bind(adminQuery);
        const originalDelete = adminQuery.delete.bind(adminQuery);

        return {
          ...adminQuery,
          select: async (...args: any[]) => {
            const res = await originalSelect(...args);
            if (res.error && (res.error.code === 'PGRST106' || res.status === 406)) {
              // Schema not exposed, fallback to public schema table
              return await supabasePublicSchema.from(tableName).select(...args);
            }
            return res;
          },
          insert: async (values: any[]) => {
            const res = await originalInsert(values);
            if (res.error && (res.error.code === 'PGRST106' || res.status === 406)) {
              return await supabasePublicSchema.from(tableName).insert(values);
            }
            return res;
          },
          update: async (values: any) => {
            return {
              eq: (column: string, value: any) => {
                return (async () => {
                  const res = await adminQuery.update(values).eq(column, value);
                  if (res.error && (res.error.code === 'PGRST106' || res.status === 406)) {
                    return await supabasePublicSchema.from(tableName).update(values).eq(column, value);
                  }
                  return res;
                })();
              }
            };
          },
          upsert: async (values: any) => {
            const res = await originalUpsert(values);
            if (res.error && (res.error.code === 'PGRST106' || res.status === 406)) {
              return await supabasePublicSchema.from(tableName).upsert(values);
            }
            return res;
          },
          delete: async () => {
            return {
              eq: (column: string, value: any) => {
                return (async () => {
                  const res = await adminQuery.delete().eq(column, value);
                  if (res.error && (res.error.code === 'PGRST106' || res.status === 406)) {
                    return await supabasePublicSchema.from(tableName).delete().eq(column, value);
                  }
                  return res;
                })();
              }
            };
          }
        };
      };
    }
    return (target as any)[prop];
  }
});

export const isSupabaseConfigured = () => true;

// Helper to clear all records
export const clearAllSupabaseTables = async () => {
  try {
    await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('addons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('chassis').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('All demo data cleared from Supabase.');
  } catch (err) {
    console.warn('Error clearing Supabase tables:', err);
  }
};
