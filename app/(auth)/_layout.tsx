import { authColors } from '@/auth/authTheme';
import { AuthFlowProvider } from '@/hooks/useAuthFlow';
import {
  Inter_400Regular,
  Inter_500Medium,
  useFonts,
} from '@expo-google-fonts/inter';
import { Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function AuthLayout() {
  const [loaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useEffect(() => {
    if (loaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, fontError]);

  if (!loaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: authColors.canvas }} />;
  }

  return (
    <AuthFlowProvider>
      <Stack
        initialRouteName="welcome"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: authColors.canvas },
        }}
      />
    </AuthFlowProvider>
  );
}
