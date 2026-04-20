import { authColors, authFonts, grid, useAuthLayout } from '@/auth/authTheme';
import { AuthButton } from '@/components/auth/AuthButton';
import { OtpBox } from '@/components/auth/OtpBox';
import { persistSession } from '@/hooks/useAuth';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { otpCodeSchema } from '@/utils/validation';
import * as Haptics from 'expo-haptics';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const OTP_LEN = 6;

export default function OtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const layout = useAuthLayout();
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = typeof params.phone === 'string' ? params.phone : '';

  const { verifyOtp, resendOtp, resendIn, busy, error, setError } = useAuthFlow();

  const [otpBoxes, setOtpBoxes] = useState<string[]>(() => Array(OTP_LEN).fill(''));
  const [shakeKey, setShakeKey] = useState(0);
  const [success, setSuccess] = useState(false);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const verifyInFlight = useRef(false);

  const otpJoined = otpBoxes.join('');

  useEffect(() => {
    setError(null);
  }, [setError]);

  const runVerify = useCallback(
    async (code: string) => {
      const parsed = otpCodeSchema.safeParse({ otp: code });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? 'Invalid code');
        setShakeKey((k) => k + 1);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      if (verifyInFlight.current) return;
      verifyInFlight.current = true;
      setError(null);
      try {
        const result = await verifyOtp(phone, code);
        if (result.kind === 'error') {
          setError(result.message);
          setShakeKey((k) => k + 1);
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
        }
        if (result.kind === 'logged_in') {
          setSuccess(true);
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await persistSession(result.token, result.user);
          setTimeout(() => router.replace('/(tabs)'), 420);
          return;
        }
        if (result.kind === 'needs_profile') {
          setSuccess(true);
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setTimeout(() => router.replace('/(auth)/complete-profile'), 420);
          return;
        }
        if (result.kind === '2fa_required') {
          setSuccess(true);
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setTimeout(() => router.replace('/(auth)/two-factor'), 420);
          return;
        }
      } finally {
        verifyInFlight.current = false;
      }
    },
    [phone, router, setError, verifyOtp]
  );

  const maybeAutoVerify = useCallback(
    (joined: string) => {
      if (joined.length !== 6 || success || busy) return;
      requestAnimationFrame(() => {
        void runVerify(joined);
      });
    },
    [busy, runVerify, success]
  );

  const setOtpDigit = (index: number, char: string) => {
    const d = char.replace(/\D/g, '').slice(-1);
    setOtpBoxes((prev) => {
      const next = [...prev];
      next[index] = d;
      const joined = next.join('');
      if (joined.length === 6) {
        maybeAutoVerify(joined);
      }
      if (d && index < OTP_LEN - 1) {
        requestAnimationFrame(() => otpRefs.current[index + 1]?.focus());
      }
      return next;
    });
  };

  const onOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otpBoxes[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const onResend = async () => {
    await Haptics.selectionAsync();
    const ok = await resendOtp(phone);
    if (ok) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const onChangeNumber = () => {
    void Haptics.selectionAsync();
    router.replace('/(auth)/welcome');
  };

  const fillFromPaste = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, OTP_LEN).split('');
    const next = Array(OTP_LEN)
      .fill('')
      .map((_, i) => digits[i] ?? '');
    setOtpBoxes(next);
    const joined = next.join('');
    if (joined.length === 6) {
      maybeAutoVerify(joined);
    }
    const last = Math.min(Math.max(digits.length - 1, 0), OTP_LEN - 1);
    requestAnimationFrame(() => otpRefs.current[last]?.focus());
  };

  if (!phone || phone.length !== 10) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const cardPad = layout.horizontal;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: authColors.canvas }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TextInput
        value={otpJoined}
        onChangeText={fillFromPaste}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        caretHidden
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0.02 }}
        importantForAutofill="yes"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + grid(4),
          paddingBottom: insets.bottom + grid(4),
          paddingHorizontal: layout.isWideCard ? Math.max(grid(4), (layout.width - layout.maxContentWidth) / 2) : cardPad,
          maxWidth: layout.isWideCard ? layout.maxContentWidth : undefined,
          alignSelf: layout.isWideCard ? 'center' : 'stretch',
          width: layout.isWideCard ? '100%' : undefined,
        }}
      >
        <Text
          style={{
            fontFamily: authFonts.display,
            fontSize: layout.mode === 'compact' ? 26 : 30,
            letterSpacing: -0.4,
            color: authColors.text,
            marginBottom: grid(2),
          }}
        >
          Enter OTP
        </Text>
        <Text style={{ fontFamily: authFonts.body, fontSize: 15, color: authColors.textMuted, marginBottom: grid(6) }}>
          We sent a 6-digit code to{' '}
          <Text style={{ fontFamily: authFonts.bodyMedium, color: authColors.text }}>+91 {phone}</Text>
        </Text>

        <View style={{ flexDirection: 'row', gap: grid(3), marginBottom: grid(4), justifyContent: 'center' }}>
          {otpBoxes.map((digit, i) => (
            <OtpBox
              key={i}
              ref={(el) => {
                otpRefs.current[i] = el;
              }}
              index={i}
              value={digit}
              onChangeText={(t) => setOtpDigit(i, t)}
              onKeyPress={(key) => onOtpKeyPress(i, key)}
              shakeToken={shakeKey}
              success={success}
              editable={!busy}
            />
          ))}
        </View>

        {error ? (
          <Text style={{ marginBottom: grid(3), color: authColors.error, fontFamily: authFonts.body, textAlign: 'center' }}>
            {error}
          </Text>
        ) : null}

        <AuthButton
          title="Continue"
          fullWidth
          loading={busy}
          disabled={busy || otpJoined.length !== 6}
          onPress={() => runVerify(otpJoined)}
        />

        <Pressable
          onPress={onResend}
          disabled={resendIn > 0 || busy}
          style={({ pressed }) => ({
            marginTop: grid(4),
            alignItems: 'center',
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: authFonts.label,
              fontSize: 15,
              color: resendIn > 0 ? authColors.textMuted : authColors.primary,
            }}
          >
            {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
          </Text>
        </Pressable>

        <Pressable
          onPress={onChangeNumber}
          style={({ pressed }) => ({
            marginTop: grid(3),
            alignItems: 'center',
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <Text style={{ fontFamily: authFonts.body, fontSize: 15, color: authColors.textMuted }}>Change number</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
