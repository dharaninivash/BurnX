import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// WebSocket polyfill for Node.js environment
if (typeof globalThis !== 'undefined' && !globalThis.WebSocket) {
  try {
    globalThis.WebSocket = require('ws');
  } catch (e) {
    globalThis.WebSocket = class DummyWebSocket {};
  }
}

// In-Memory fallback storage for Node / test environments
const memoryStorage = new Map();
const customStorage = {
  getItem: async (key) => {
    if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
      try { return await AsyncStorage.getItem(key); } catch (e) {}
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return memoryStorage.get(key) || null;
  },
  setItem: async (key, value) => {
    if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
      try { return await AsyncStorage.setItem(key, value); } catch (e) {}
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.setItem(key, value);
    }
    memoryStorage.set(key, value);
  },
  removeItem: async (key) => {
    if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
      try { return await AsyncStorage.removeItem(key); } catch (e) {}
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.removeItem(key);
    }
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
