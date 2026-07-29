import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useStore } from './src/store/useStore';

export default function App() {
  const checkDailyReset = useStore((state) => state.checkDailyReset);

  useEffect(() => {
    // Initial check on launch
    if (checkDailyReset) {
      checkDailyReset();
    }

    // Interval check every minute for midnight transition
    const interval = setInterval(() => {
      if (checkDailyReset) {
        checkDailyReset();
      }
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
