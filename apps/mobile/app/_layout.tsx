import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useCart } from '@/lib/cart';
import { fetchMenu } from '@/lib/api';

export default function RootLayout() {
  const setMenu = useCart((s) => s.setMenu);

  useEffect(() => {
    fetchMenu()
      .then(setMenu)
      .catch((err) => {
        console.warn('Failed to load menu', err);
      });
  }, [setMenu]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0B0B0E' },
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
