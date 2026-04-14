import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/theme';
import { useAppStore } from '@/stores/appStore';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const router = useRouter();
  const complete = useAppStore((s) => s.setOnboardingComplete);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing(2), paddingBottom: insets.bottom + spacing(2) }]}>
      <View style={styles.hero}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.title}>AmazePays</Text>
        <Text style={styles.sub}>
          Buy digital gift cards and track orders in one place.
        </Text>
      </View>
      <View>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing(2),
    justifyContent: 'space-between',
  },
  hero: { flex: 1, justifyContent: 'center' },
  logo: { width: 96, height: 96, alignSelf: 'center', marginBottom: spacing(2) },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  sub: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: spacing(1.5),
    lineHeight: 24,
  },
});
