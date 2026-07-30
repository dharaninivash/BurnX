import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useStore } from './src/store/useStore';
import { supabase } from './src/services/supabase';

export default function App() {
  const checkDailyReset = useStore((state) => state.checkDailyReset);
  const checkSubscriptionStatus = useStore((state) => state.checkSubscriptionStatus);

  useEffect(() => {
    // Initial check on launch
    if (checkDailyReset) checkDailyReset();
    if (checkSubscriptionStatus) checkSubscriptionStatus();

    // Step 14 & 17: Persist Auth Session & Sync Profiles Table
    let authListener = null;
    if (supabase && supabase.auth) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          useStore.getState().logout();
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user;
          const userMeta = user.user_metadata || {};
          const userName = userMeta.full_name || userMeta.name || user.email?.split('@')[0] || 'Athlete';
          const avatarUrl = userMeta.avatar_url || userMeta.picture || null;

          // Sync session user into Zustand store
          const currentUser = useStore.getState().user;
          if (!currentUser || currentUser.email !== user.email) {
            useStore.getState().completeOnboarding({
              id: user.id,
              name: userName,
              email: user.email,
              avatar: avatarUrl,
              role: 'client'
            });
          }

          // Step 17: Store Extra User Data in profiles table
          try {
            await supabase.from('profiles').upsert({
              id: user.id,
              name: userName,
              email: user.email,
              avatar: avatarUrl,
              updated_at: new Date().toISOString()
            });
          } catch (err) {
            console.log('Profile sync note:', err?.message);
          }
        }
      });
      authListener = data?.subscription;
    }

    // Interval check every minute for midnight transition & subscription expiry
    const interval = setInterval(() => {
      if (checkDailyReset) checkDailyReset();
      if (checkSubscriptionStatus) checkSubscriptionStatus();
    }, 60000);

    return () => {
      clearInterval(interval);
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
