import { authApi } from '@/api/auth';
import { authColors, authFonts, grid, useAuthLayout } from '@/auth/authTheme';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { persistSession } from '@/hooks/useAuth';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import * as Haptics from 'expo-haptics';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TwoFactorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const layout = useAuthLayout();
  const { twoFaTempToken, clearPostOtpState } = useAuthFlow();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!twoFaTempToken) {
    return <Redirect href="/(auth)/welcome" />;
  }

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
      style={{ flex: 1, backgroundColor: authColors.canvas }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + grid(4),
          paddingBottom: insets.bottom + grid(4),
          paddingHorizontal: layout.horizontal,
          maxWidth: layout.isWideCard ? layout.maxContentWidth : undefined,
          alignSelf: layout.isWideCard ? 'center' : 'stretch',
          width: layout.isWideCard ? '100%' : undefined,
        }}
      >
        <Text
          style={{
            fontFamily: authFonts.display,
            fontSize: 28,
            letterSpacing: -0.4,
            color: authColors.text,
            marginBottom: grid(2),
          }}
        >
          Two-factor auth
        </Text>
        <Text style={{ fontFamily: authFonts.body, fontSize: 15, color: authColors.textMuted, marginBottom: grid(5) }}>
          Enter the code from your authenticator app.
        </Text>

        <AuthInput
          label="Authenticator code"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          autoComplete="off"
        />

        {error ? (
          <Text style={{ marginBottom: grid(2), color: authColors.error, fontFamily: authFonts.body }}>{error}</Text>
        ) : null}

        <AuthButton title="Verify" fullWidth onPress={onVerify} loading={busy} disabled={busy} />
      </View>
    </KeyboardAvoidingView>
  );
}
