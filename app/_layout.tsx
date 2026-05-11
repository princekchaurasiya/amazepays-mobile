import 'react-native-reanimated';
import { setUnauthorizedHandler } from '@/api/client';
import { authApi } from '@/api/auth';
import '@/sentry';
import '../global.css';
import { useAuthStore } from '@/stores/authStore';
import { clearAuthToken, getAuthToken } from '@/utils/storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Colors } from '@/constants/colors';
import {  colors} from '@/theme';
import { StatusBar, Text, View ,Image} from 'react-native';
import {
  initialWindowMetrics,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 }, // 5 minutes
  },
});

function SafeAreaShell({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        paddingBottom: insets.bottom,
      }}
    >
      {children}
    </View>
  );
}

function BrandSplash() {
  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: Colors.neutral[50] }}>
      <View
        style={{
          width: 116,
          height: 116,
          borderRadius: 58,
          backgroundColor: Colors.neutral[0],
          borderWidth: 1,
          borderColor: Colors.neutral[200],
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: Colors.brand[600],
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 6,
          marginBottom: 16,
        }}
      >
        <Image source={require('../assets/logo.png')} style={{ width: 70, height: 70 }} resizeMode="contain" />
      </View>
      <Text style={{ fontSize: 34, fontWeight: '800', letterSpacing: 0.5 }}>
        <Text style={{ color: Colors.brand[600] }}>AMAZE</Text>
        <Text style={{ color: Colors.accentColors[500] }}>PAYS</Text>
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      useAuthStore.getState().logout();
      router.replace('/(auth)/welcome');
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
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics ?? undefined}>
        <SafeAreaShell>
          <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
          {isHydrated ? (
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            />
          ) : (
            <BrandSplash />
          )}
        </SafeAreaShell>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
