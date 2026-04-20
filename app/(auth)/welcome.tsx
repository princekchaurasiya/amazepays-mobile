import { authColors, authFonts, authRadii, grid, useAuthLayout } from '@/auth/authTheme';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { useAppStore } from '@/stores/appStore';
import { normalizeIndianMobile, phoneSchema } from '@/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useCallback, useEffect, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

type PhoneForm = z.infer<typeof phoneSchema>;

const LOGO_ASPECT = 120 / 56;

function formatPhoneDisplay(digits: string) {
  const d = digits.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)} ${d.slice(5)}`;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setGuest = useAppStore((s) => s.setAllowGuestBrowse);
  const { sendOtp, busy, error, setError } = useAuthFlow();
  const layout = useAuthLayout();

  const logoScale = useSharedValue(1);
  useEffect(() => {
    logoScale.value = withRepeat(
      withSequence(withTiming(1.04, { duration: 700 }), withTiming(1, { duration: 700 })),
      2,
      false
    );
  }, [logoScale]);

  const logoPulse = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { mobile: '' },
  });

  const logoWidth = layout.width * 0.4;
  const landscapeSplit = layout.landscape && layout.width >= 600;

  const onContinue = phoneForm.handleSubmit(async ({ mobile }) => {
    setError(null);
    const ok = await sendOtp(mobile);
    if (!ok) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/(auth)/otp', params: { phone: mobile } });
  });

  const browse = useCallback(async () => {
    await Haptics.selectionAsync();
    setGuest(true);
    router.replace('/(tabs)');
  }, [router, setGuest]);

  const cardShellStyle = useMemo(
    () =>
      layout.isWideCard
        ? {
            borderRadius: authRadii.card,
            backgroundColor: authColors.background,
            paddingHorizontal: layout.horizontal,
            paddingVertical: grid(6),
            maxWidth: layout.maxContentWidth,
            width: '100%' as const,
            alignSelf: 'center' as const,
          }
        : { flex: 1 },
    [layout.horizontal, layout.isWideCard, layout.maxContentWidth]
  );

  const logoBlock = (width: number, withBottomMargin = true) => (
    <Animated.View
      style={[{ alignSelf: 'center', marginBottom: withBottomMargin ? grid(5) : 0 }, logoPulse]}
    >
      <Image
        source={require('../../assets/logo.png')}
        style={{ width, aspectRatio: LOGO_ASPECT }}
        contentFit="contain"
        accessibilityLabel="AmazePays"
      />
    </Animated.View>
  );

  const headline = (
    <>
      {!landscapeSplit ? logoBlock(logoWidth) : null}
      <Text
        style={{
          fontFamily: authFonts.display,
          fontSize: layout.mode === 'compact' ? 28 : 32,
          letterSpacing: -0.5,
          color: authColors.text,
          marginBottom: grid(2),
        }}
      >
        Welcome
      </Text>
      <Text
        style={{
          fontFamily: authFonts.body,
          fontSize: 15,
          lineHeight: 22,
          color: authColors.textMuted,
          marginBottom: grid(6),
        }}
      >
        Sign in with mobile — no password
      </Text>
    </>
  );

  const formFields = (
    <>
      {headline}
      <Controller
        control={phoneForm.control}
        name="mobile"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <AuthInput
            label="Mobile number"
            prefix="+91"
            value={formatPhoneDisplay(value)}
            onChangeText={(t) => onChange(normalizeIndianMobile(t))}
            onBlur={onBlur}
            keyboardType="phone-pad"
            placeholder="98765 43210"
            maxLength={12}
            error={fieldState.error?.message}
            autoComplete="tel"
            textContentType="telephoneNumber"
          />
        )}
      />

      {error ? (
        <Text style={{ marginBottom: grid(2), color: authColors.error, fontFamily: authFonts.body }}>{error}</Text>
      ) : null}

      <AuthButton title="Continue" fullWidth onPress={onContinue} loading={busy} disabled={busy} />

      <Pressable
        onPress={browse}
        style={({ pressed }) => ({
          marginTop: grid(4),
          paddingVertical: grid(2),
          alignItems: 'center',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontFamily: authFonts.body, fontSize: 15, color: authColors.textMuted }}>
          Browse without account
        </Text>
      </Pressable>
    </>
  );

  const scrollBody = (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: grid(4),
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={cardShellStyle}>{formFields}</View>
    </ScrollView>
  );

  const landscapeLogoW = Math.min(layout.height * 0.36, 220);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: authColors.canvas }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + grid(2),
          paddingBottom: insets.bottom + grid(2),
          paddingHorizontal: layout.isWideCard ? grid(4) : layout.horizontal,
        }}
      >
        {landscapeSplit ? (
          <View style={{ flex: 1, flexDirection: 'row', gap: grid(8), alignItems: 'stretch' }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              {logoBlock(landscapeLogoW, false)}
            </View>
            <View style={{ flex: 1 }}>{scrollBody}</View>
          </View>
        ) : (
          scrollBody
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
