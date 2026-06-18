import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = 'https://fylhsejtswiybhguseae.supabase.co';
const supabaseAnonKey = 'sb_publishable_Jsi_ruvrIbQMlGcUywXX8w_mutHgmoA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
