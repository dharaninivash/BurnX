import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useStore } from './src/store/useStore';
import { supabase } from './src/services/supabase';
import { checkUserProfile } from './src/services/authProfileService';
import { initLiveSync } from './src/services/liveSyncService';

export default function App() {
  const checkDailyReset = useStore((state) => state.checkDailyReset);
  const checkSubscriptionStatus = useStore((state) => state.checkSubscriptionStatus);

  useEffect(() => {
    // Initial check on launch
    if (checkDailyReset) checkDailyReset();
    if (checkSubscriptionStatus) checkSubscriptionStatus();

    // 9. On app startup & session state change:
    // Restore Supabase session -> Query profiles table -> Direct to Home if complete, else Onboarding.
    let authListener = null;
    if (supabase && supabase.auth) {
      const handleAuthSession = async (event, session) => {
        try {
          if (event === 'SIGNED_OUT' || !session?.user) {
            useStore.getState().logout();
            return;
          }

          if (session?.user) {
            initLiveSync(session.user.id);
            const result = await checkUserProfile(session.user);
            if (result.status === 'COMPLETE' && result.profile) {
              // Profile exists & complete -> Load data -> Go to Home
              useStore.getState().setVerifiedProfile(result.profile);
            } else {
              // Profile missing or incomplete -> DO NOT create profile automatically -> Direct to Onboarding
              useStore.getState().setPendingAuthUser(result.user || {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Athlete'
              });
            }
          }
        } catch (err) {
          console.warn('Auth session handler exception:', err?.message);
        }
      };

      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        handleAuthSession(event, session);
      });
      authListener = data?.subscription;

      // Check current session immediately on startup
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          handleAuthSession('INITIAL_SESSION', session);
        }
      });
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
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
