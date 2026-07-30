import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Safe storage adapter for Web, React Native, and Node environments
const memoryStorage = new Map();
const customStorage = {
  getItem: async (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        return await AsyncStorage.getItem(key);
      }
    } catch (e) {}
    return memoryStorage.get(key) || null;
  },
  setItem: async (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.setItem(key, value);
      }
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        return await AsyncStorage.setItem(key, value);
      }
    } catch (e) {}
    memoryStorage.set(key, value);
  },
  removeItem: async (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.removeItem(key);
      }
      if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
        return await AsyncStorage.removeItem(key);
      }
    } catch (e) {}
    memoryStorage.delete(key);
  }
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fylhsejtswiybhguseae.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Jsi_ruvrIbQMlGcUywXX8w_mutHgmoA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
