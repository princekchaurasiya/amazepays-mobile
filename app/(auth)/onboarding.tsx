import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/theme';
import { useAppStore } from '@/stores/appStore';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const router = useRouter();
  const complete = useAppStore((s) => s.setOnboardingComplete);
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 justify-between bg-background px-4"
      style={{
        paddingTop: (Platform.OS === 'ios' ? insets.top : 0) + spacing(2),
        paddingBottom: insets.bottom + spacing(2),
      }}
    >
      <View className="flex-1 justify-center">
        <View
          className="rounded-3xl border border-border bg-surface px-4 py-6"
          style={Platform.select({
            ios: {
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 14 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
            },
            android: { elevation: 7 },
            default: {},
          })}
        >
          <View className="mb-4 h-[108px] w-[108px] self-center items-center justify-center rounded-full border border-border bg-surface2">
            <Image source={require('../../assets/logo.png')} style={{ width: 84, height: 84 }} contentFit="contain" />
          </View>
          <Text className="text-center text-3xl font-extrabold text-text">AmazePays</Text>
          <Text className="mt-3 text-center text-base leading-6 text-text-muted">
            Buy digital gift cards and track orders in one place.
          </Text>
        </View>
      </View>
      <View className="pt-3">
        <Button
          title="Get started"
          fullWidth
          onPress={() => {
            complete(true);
            router.replace('/(auth)/login');
          }}
        />
        <Button
          title="I already have an account"
          variant="outline"
          fullWidth
          style={{ marginTop: spacing(1) }}
          onPress={() => {
            complete(true);
            router.replace('/(auth)/login');
          }}
        />
      </View>
    </View>
  );
}
