import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client that won't crash the app if not configured
let supabase: SupabaseClient;

try {
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'YOUR_SUPABASE_URL_HERE' || 
      supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
    console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    
    // Create a mock client that won't crash the app
    supabase = {
      auth: {
        signUp: () => Promise.reject(new Error('Supabase not configured')),
        signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
        signOut: () => Promise.reject(new Error('Supabase not configured')),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => Promise.reject(new Error('Supabase not configured')),
        insert: () => Promise.reject(new Error('Supabase not configured')),
        update: () => Promise.reject(new Error('Supabase not configured')),
        delete: () => Promise.reject(new Error('Supabase not configured')),
        eq: () => Promise.reject(new Error('Supabase not configured')),
        single: () => Promise.reject(new Error('Supabase not configured'))
      }),
      rpc: () => Promise.reject(new Error('Supabase not configured'))
    } as unknown as SupabaseClient;
  } else {
    // Validate URL format
    new URL(supabaseUrl);
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error('Invalid Supabase URL format:', error);
  throw new Error('Invalid Supabase URL. Please check your environment configuration.');
}

export { supabase };