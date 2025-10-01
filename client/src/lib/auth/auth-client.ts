// import { createClient } from '@supabase/supabase-js'
// import { supabaseUrl, supabaseAnonKey } from '../env'

// Mock Supabase client for development
export const supabaseClient = {
  auth: {
    signInWithPassword: async () => ({ data: { user: null }, error: null }),
    signUp: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: (callback: any) => {
      // Mock user for development
      callback('SIGNED_IN', { user: { id: 'test-user', email: 'test@example.com' } });
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
  },
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: [], error: null }),
    update: () => ({ data: [], error: null }),
    delete: () => ({ data: [], error: null }),
  }),
}

// export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     storage: localStorage,
//     autoRefreshToken: true,
//     persistSession: true,
//   },
// })
