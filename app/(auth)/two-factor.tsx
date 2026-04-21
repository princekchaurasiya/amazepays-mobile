import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { persistSession } from '@/hooks/useAuth';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { colors, spacing } from '@/theme';
import { ms } from '@/utils/scaling';
import * as Haptics from 'expo-haptics';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TwoFactorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { twoFaTempToken, clearPostOtpState } = useAuthFlow();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!twoFaTempToken) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const isWide = width >= 768;
  const contentWidth = Math.min(width - spacing(6), ms(560));

  const onVerify = async () => {
    if (!code.trim()) {
      setError('Enter your authenticator code');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await authApi.verifyTwoFactor(code.trim(), twoFaTempToken);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearPostOtpState();
      await persistSession(res.token, res.user);
      router.replace('/(tabs)');
    } catch {
      setError('Invalid 2FA code');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: Colors.neutral[50] }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        className="flex-1"
        style={{
          paddingTop: insets.top + spacing(1),
          paddingBottom: insets.bottom + spacing(2),
          paddingHorizontal: spacing(2),
        }}
      >
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View
            className="self-center w-full rounded-2xl border border-border bg-surface"
            style={{
              maxWidth: contentWidth,
              paddingHorizontal: spacing(2.5),
              paddingVertical: spacing(3),
            }}
          >
            <Text
              className="text-center font-semibold"
              style={{
                fontSize: isWide ? ms(30) : ms(26),
                color: colors.primary,
                marginBottom: spacing(1),
              }}
            >
              Two-factor auth
            </Text>
            <Text
              className="text-center"
              style={{ fontSize: ms(15), color: colors.textMuted, marginBottom: spacing(3) }}
            >
              Enter the code from your authenticator app.
            </Text>

            <View style={{ marginBottom: spacing(2) }}>
              <Text className="font-medium" style={{ color: colors.text, marginBottom: spacing(1), fontSize: ms(14) }}>
                Authenticator code
              </Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoComplete="off"
                editable={!busy}
                className="rounded-xl border border-border bg-surface2 text-text"
                style={{ minHeight: ms(52), paddingHorizontal: spacing(1.5), fontSize: ms(15) }}
              />
            </View>

            {error ? (
              <Text style={{ marginBottom: spacing(1.5), color: colors.danger, fontSize: ms(13) }}>{error}</Text>
            ) : null}

            <Button title="Verify" fullWidth onPress={onVerify} loading={busy} disabled={busy} />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
