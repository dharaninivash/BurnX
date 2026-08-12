import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useStore } from './src/store/useStore';
import { supabase } from './src/services/supabase';
import { checkUserProfile } from './src/services/authProfileService';
import { initLiveSync } from './src/services/liveSyncService';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('BurnX Global Web Error Boundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    } else {
      this.setState({ hasError: false, error: null });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#0D0D12', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 32, fontWeight: '900', color: '#FF5722', marginBottom: 12 }}>BURNX</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' }}>Application Initialized</Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 24, textAlign: 'center', maxWidth: 400 }}>
            {this.state.error?.message || 'A minor display reconciliation occurred. Tap below to reload your dashboard.'}
          </Text>
          <TouchableOpacity
            onPress={this.handleReload}
            style={{ backgroundColor: '#FF5722', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>Reload BurnX Platform</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const checkDailyReset = useStore((state) => state.checkDailyReset);
  const checkSubscriptionStatus = useStore((state) => state.checkSubscriptionStatus);

  useEffect(() => {
    // Initial check on launch
    if (checkDailyReset) checkDailyReset();
    if (checkSubscriptionStatus) checkSubscriptionStatus();

    // On app startup & session state change:
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
              // Profile missing or incomplete -> Direct to Onboarding
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
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <AppNavigator />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
