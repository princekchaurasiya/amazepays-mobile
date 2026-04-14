import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native';

export default function Index() {
  const hydrated = useAuthStore((s) => s.isHydrated);
  const authenticated = useAuthStore((s) => s.isAuthenticated);
  const onboarded = useAppStore((s) => s.hasCompletedOnboarding);
  const guest = useAppStore((s) => s.allowGuestBrowse);

  if (!hydrated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!onboarded) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (!authenticated && !guest) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
