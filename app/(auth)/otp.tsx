import { Button } from '@/components/ui/Button';
import { persistSession } from '@/hooks/useAuth';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { Colors } from '@/constants/colors';
import { colors, spacing } from '@/theme';
import { ms } from '@/utils/scaling';
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
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const OTP_LEN = 6;

export default function OtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = typeof params.phone === 'string' ? params.phone : '';

  const { verifyOtp, resendOtp, resendIn, busy, error, setError } = useAuthFlow();

  const [otpBoxes, setOtpBoxes] = useState<string[]>(() => Array(OTP_LEN).fill(''));
  const [success, setSuccess] = useState(false);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const hiddenOtpRef = useRef<TextInput | null>(null);
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
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
        }

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (result.kind === 'logged_in') {
          await persistSession(result.token, result.user);
          setTimeout(() => router.replace('/(tabs)'), 400);
        } else if (result.kind === 'needs_profile') {
          setTimeout(() => router.replace('/(auth)/complete-profile'), 400);
        } else if (result.kind === '2fa_required') {
          setTimeout(() => router.replace('/(auth)/two-factor'), 400);
        }
      } finally {
        verifyInFlight.current = false;
      }
    },
    [phone, router, setError, verifyOtp]
  );

  const maybeAutoVerify = (joined: string) => {
    if (joined.length === 6 && !busy) {
      requestAnimationFrame(() => runVerify(joined));
    }
  };

  const setOtpDigit = (index: number, char: string) => {
    const d = char.replace(/\D/g, '').slice(-1);

    setOtpBoxes((prev) => {
      const next = [...prev];
      next[index] = d;

      const joined = next.join('');
      if (joined.length === 6) maybeAutoVerify(joined);

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
    if (joined.length === 6) maybeAutoVerify(joined);
  };

  if (!phone || phone.length !== 10) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const isWide = width >= 768;
  const contentWidth = Math.min(width - spacing(6), ms(560));

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: Colors.neutral[50] }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Hidden OTP autofill */}
      <TextInput
        ref={hiddenOtpRef}
        value={otpJoined}
        onChangeText={fillFromPaste}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
      />

      <View
        className="flex-1"
        style={{
          paddingTop: insets.top + spacing(1),
          paddingBottom: insets.bottom + spacing(2),
          paddingHorizontal: spacing(2),
        }}
      >
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
            Enter OTP
          </Text>

          <Text
            className="text-center"
            style={{ fontSize: ms(15), color: colors.textMuted, marginBottom: spacing(3) }}
          >
            We sent a code to{' '}
            <Text style={{ color: colors.text, fontWeight: '600' }}>+91 {phone}</Text>
          </Text>

          {/* OTP Boxes */}
          <Pressable onPress={() => hiddenOtpRef.current?.focus()}>
            <View className="flex-row justify-center" style={{ marginBottom: spacing(3) }}>
              {otpBoxes.map((digit, i) => (
                <View key={i} style={{ marginHorizontal: spacing(0.5) }}>
                  <TextInput
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    value={digit}
                    onChangeText={(t) => setOtpDigit(i, t)}
                    onKeyPress={({ nativeEvent }) => onOtpKeyPress(i, nativeEvent.key)}
                    keyboardType="number-pad"
                    maxLength={1}
                    editable={!busy}
                    style={{
                      width: isWide ? ms(50) : ms(44),
                      height: isWide ? ms(58) : ms(52),
                      borderRadius: spacing(1.5),
                      borderWidth: 1,
                      borderColor: colors.border,
                      textAlign: 'center',
                      fontSize: ms(20),
                      color: colors.text,
                      backgroundColor: colors.surface2,
                    }}
                  />
                </View>
              ))}
            </View>
          </Pressable>

          {error && (
            <Text
              className="text-center"
              style={{ marginBottom: spacing(2), color: colors.danger }}
            >
              {error}
            </Text>
          )}

          {/* ✅ Button wrapped */}
          <View style={{ marginBottom: spacing(2) }}>
            <Button
              title="Continue"
              fullWidth
              loading={busy}
              disabled={busy || otpJoined.length !== 6}
              onPress={() => runVerify(otpJoined)}
            />
          </View>

          {/* Resend */}
          <View className="items-center">
            <Pressable
              onPress={onResend}
              disabled={resendIn > 0 || busy}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                paddingVertical: spacing(1),
              })}
            >
              <Text
                style={{
                  fontSize: ms(15),
                  color: resendIn > 0 ? colors.textMuted : colors.primary,
                }}
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
              </Text>
            </Pressable>
          </View>

          {/* Change number */}
          <View className="items-center" style={{ marginTop: spacing(1.5) }}>
            <Pressable
              onPress={onChangeNumber}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Text style={{ fontSize: ms(15), color: colors.textMuted }}>
                Change number
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
