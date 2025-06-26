import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables and provide helpful error messages
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your_supabase_url' || 
    supabaseAnonKey === 'your_supabase_anon_key') {
  console.warn('Supabase not configured. Please click "Connect to Supabase" to set up your database connection.');
  
  // Create a mock client that won't crash the app
  export const supabase = {
    auth: {
      signUp: () => Promise.reject(new Error('Supabase not configured')),
      signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
      signOut: () => Promise.reject(new Error('Supabase not configured')),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => Promise.reject(new Error('Supabase not configured')),
      insert: () => Promise.reject(new Error('Supabase not configured')),
      update: () => Promise.reject(new Error('Supabase not configured')),
      delete: () => Promise.reject(new Error('Supabase not configured'))
    })
  } as any;
} else {
  try {
    // Validate URL format
    new URL(supabaseUrl);
    export const supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Invalid Supabase URL format:', supabaseUrl);
    throw new Error('Invalid Supabase URL. Please check your environment configuration.');
  }
}