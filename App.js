import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useStore } from './src/store/useStore';

export default function App() {
  const checkDailyReset = useStore((state) => state.checkDailyReset);
  const checkSubscriptionStatus = useStore((state) => state.checkSubscriptionStatus);

  useEffect(() => {
    // Initial check on launch
    if (checkDailyReset) checkDailyReset();
    if (checkSubscriptionStatus) checkSubscriptionStatus();

    // Interval check every minute for midnight transition & subscription expiry
    const interval = setInterval(() => {
      if (checkDailyReset) checkDailyReset();
      if (checkSubscriptionStatus) checkSubscriptionStatus();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
