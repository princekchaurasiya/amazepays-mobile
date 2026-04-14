import { setUnauthorizedHandler } from '@/api/client';
import { authApi } from '@/api/auth';
import '@/sentry';
import '../global.css';
import { useAuthStore } from '@/stores/authStore';
import { clearAuthToken, getAuthToken } from '@/utils/storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { colors } from '@/theme';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
  },
});

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      useAuthStore.getState().logout();
      router.replace('/(auth)/login');
    });
    return () => setUnauthorizedHandler(null);
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getAuthToken();
        if (token && !cancelled) {
          const user = await authApi.me();
          if (!cancelled) useAuthStore.getState().login(user);
        }
      } catch {
        await clearAuthToken();
        if (!cancelled) useAuthStore.getState().logout();
      } finally {
        if (!cancelled) {
          useAuthStore.getState().setHydrated(true);
          await SplashScreen.hideAsync();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
