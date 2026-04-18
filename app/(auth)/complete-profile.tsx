import { authApi } from '@/api/auth';
import { authColors, authFonts, grid, useAuthLayout } from '@/auth/authTheme';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { persistSession } from '@/hooks/useAuth';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { captureException } from '@/sentry';
import { newUserProfileSchema } from '@/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { Redirect, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

type ProfileForm = z.infer<typeof newUserProfileSchema>;

export default function CompleteProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const layout = useAuthLayout();
  const { profileTempToken, clearPostOtpState } = useAuthFlow();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(newUserProfileSchema),
    defaultValues: { name: '', email: '', referral_code: '' },
  });

  if (!profileTempToken) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const onSubmit = profileForm.handleSubmit(async (values) => {
    setError(null);
    setBusy(true);
    try {
      const emailTrim = values.email?.trim();
      const res = await authApi.completeProfile({
        temp_token: profileTempToken,
        name: values.name.trim(),
        email: emailTrim === '' ? undefined : emailTrim,
        referral_code: values.referral_code?.trim() || undefined,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearPostOtpState();
      await persistSession(res.token, res.user);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      captureException(e);
      const err = e as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msg = err.response?.data?.message;
      const firstField =
        err.response?.data?.errors && Object.values(err.response.data.errors)[0]?.[0];
      setError(firstField ?? msg ?? 'Could not complete sign-up');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setBusy(false);
    }
  });

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
          Almost there
        </Text>
        <Text style={{ fontFamily: authFonts.body, fontSize: 15, color: authColors.textMuted, marginBottom: grid(5) }}>
          Add your name. Email and referral are optional.
        </Text>

        <Controller
          control={profileForm.control}
          name="name"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <AuthInput
              label="Full name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={profileForm.control}
          name="email"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <AuthInput
              label="Email (optional)"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={profileForm.control}
          name="referral_code"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <AuthInput
              label="Referral code (optional)"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="characters"
              error={fieldState.error?.message}
            />
          )}
        />

        {error ? (
          <Text style={{ marginBottom: grid(2), color: authColors.error, fontFamily: authFonts.body }}>{error}</Text>
        ) : null}

        <AuthButton title="Complete sign-up" fullWidth onPress={onSubmit} loading={busy} disabled={busy} />
      </View>
    </KeyboardAvoidingView>
  );
}
