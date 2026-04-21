import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { persistSession } from '@/hooks/useAuth';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { captureException } from '@/sentry';
import { colors, spacing } from '@/theme';
import { ms } from '@/utils/scaling';
import { newUserProfileSchema } from '@/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { Redirect, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

type ProfileForm = z.infer<typeof newUserProfileSchema>;

export default function CompleteProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
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

  const isWide = width >= 768;
  const contentWidth = Math.min(width - spacing(6), ms(560));

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
              Almost there
            </Text>
            <Text
              className="text-center"
              style={{ fontSize: ms(15), color: colors.textMuted, marginBottom: spacing(3) }}
            >
              Add your name. Email and referral are optional.
            </Text>

            <Controller
              control={profileForm.control}
              name="name"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <View style={{ marginBottom: spacing(2) }}>
                  <Text className="font-medium" style={{ color: colors.text, marginBottom: spacing(1), fontSize: ms(14) }}>
                    Full name
                  </Text>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    editable={!busy}
                    className="rounded-xl border border-border bg-surface2 text-text"
                    style={{ minHeight: ms(52), paddingHorizontal: spacing(1.5), fontSize: ms(15) }}
                  />
                  {fieldState.error?.message ? (
                    <Text style={{ color: colors.danger, marginTop: spacing(0.75), fontSize: ms(13) }}>
                      {fieldState.error.message}
                    </Text>
                  ) : null}
                </View>
              )}
            />

            <Controller
              control={profileForm.control}
              name="email"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <View style={{ marginBottom: spacing(2) }}>
                  <Text className="font-medium" style={{ color: colors.text, marginBottom: spacing(1), fontSize: ms(14) }}>
                    Email (optional)
                  </Text>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!busy}
                    className="rounded-xl border border-border bg-surface2 text-text"
                    style={{ minHeight: ms(52), paddingHorizontal: spacing(1.5), fontSize: ms(15) }}
                  />
                  {fieldState.error?.message ? (
                    <Text style={{ color: colors.danger, marginTop: spacing(0.75), fontSize: ms(13) }}>
                      {fieldState.error.message}
                    </Text>
                  ) : null}
                </View>
              )}
            />

            <Controller
              control={profileForm.control}
              name="referral_code"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <View style={{ marginBottom: spacing(2) }}>
                  <Text className="font-medium" style={{ color: colors.text, marginBottom: spacing(1), fontSize: ms(14) }}>
                    Referral code (optional)
                  </Text>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="characters"
                    editable={!busy}
                    className="rounded-xl border border-border bg-surface2 text-text"
                    style={{ minHeight: ms(52), paddingHorizontal: spacing(1.5), fontSize: ms(15) }}
                  />
                  {fieldState.error?.message ? (
                    <Text style={{ color: colors.danger, marginTop: spacing(0.75), fontSize: ms(13) }}>
                      {fieldState.error.message}
                    </Text>
                  ) : null}
                </View>
              )}
            />

            {error ? (
              <Text style={{ marginBottom: spacing(1.5), color: colors.danger, fontSize: ms(13) }}>{error}</Text>
            ) : null}

            <Button title="Complete sign-up" fullWidth onPress={onSubmit} loading={busy} disabled={busy} />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
