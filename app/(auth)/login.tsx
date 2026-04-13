import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { persistSession } from '@/hooks/useAuth';
import { useAppStore } from '@/stores/appStore';
import { captureException } from '@/sentry';
import { colors, spacing } from '@/theme';
import {
  newUserProfileSchema,
  normalizeIndianMobile,
  otpCodeSchema,
  phoneSchema,
} from '@/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

type Step = 'phone' | 'otp' | 'profile' | '2fa';

type PhoneForm = z.infer<typeof phoneSchema>;
type ProfileForm = z.infer<typeof newUserProfileSchema>;

const OTP_LEN = 6;

function getApiErrorMessage(error: unknown, fallback: string) {
  const err = error as AxiosError<{
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
  }>;
  const firstField =
    err.response?.data?.errors && Object.values(err.response.data.errors)[0]?.[0];
  return firstField ?? err.response?.data?.message ?? err.response?.data?.error ?? fallback;
}

export default function LoginScreen() {
  const setGuest = useAppStore((s) => s.setAllowGuestBrowse);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('phone');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [twoFaTemp, setTwoFaTemp] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const [otpBoxes, setOtpBoxes] = useState<string[]>(() => Array(OTP_LEN).fill(''));

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { mobile: '' },
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(newUserProfileSchema),
    defaultValues: { name: '', email: '', referral_code: '' },
  });

  const twoFaForm = useForm<{ code: string }>({
    defaultValues: { code: '' },
  });

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const otpCodeString = otpBoxes.join('');

  const startResendCooldown = useCallback(() => {
    setResendIn(60);
  }, []);

  const onSendOtp = phoneForm.handleSubmit(async ({ mobile }) => {
    setError(null);
    setBusy(true);
    const normalized = normalizeIndianMobile(mobile);
    try {
      const r = await authApi.sendOtp(normalized, 'login');
      if (!r.success) {
        setError(r.message ?? 'Could not send OTP');
        return;
      }
      setPhoneDigits(normalized);
      setOtpBoxes(Array(OTP_LEN).fill(''));
      setStep('otp');
      startResendCooldown();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (e) {
      console.error('sendOtp failed', e);
      captureException(e);
      setError(getApiErrorMessage(e, 'Could not send OTP'));
    } finally {
      setBusy(false);
    }
  });

  const onResendOtp = async () => {
    if (resendIn > 0 || !phoneDigits) return;
    setError(null);
    setBusy(true);
    try {
      const r = await authApi.sendOtp(phoneDigits, 'login');
      if (!r.success) {
        setError(r.message ?? 'Could not resend OTP');
        return;
      }
      startResendCooldown();
    } catch (e) {
      console.error('resendOtp failed', e);
      captureException(e);
      setError(getApiErrorMessage(e, 'Could not resend OTP'));
    } finally {
      setBusy(false);
    }
  };

  const submitOtpVerify = async (code: string) => {
    const parsed = otpCodeSchema.safeParse({ otp: code });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid code');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const result = await authApi.verifyOtp(phoneDigits, code);
      if (!result.ok) {
        if (result.status === 403) {
          setError(result.data?.message ?? 'Account restricted');
        } else if (result.status === 423) {
          setError(result.data?.message ?? 'Account locked');
        } else if (result.status === 422) {
          const msg =
            result.data?.errors?.otp?.[0] ?? result.data?.message ?? 'Invalid or expired OTP';
          setError(msg);
        } else {
          setError(result.data?.message ?? 'Verification failed');
        }
        return;
      }

      const { data, status } = result;
      if (status === 202 && 'action' in data && data.action === '2fa_required' && 'temp_token' in data) {
        setTwoFaTemp(data.temp_token);
        setStep('2fa');
        return;
      }
      if ('action' in data && data.action === 'logged_in' && 'token' in data) {
        await persistSession(data.token, data.user);
        router.replace('/(tabs)');
        return;
      }
      if ('action' in data && data.action === 'needs_profile' && 'temp_token' in data) {
        setTempToken(data.temp_token);
        setStep('profile');
        return;
      }
      setError('Unexpected response');
    } catch {
      setError('Verification failed');
    } finally {
      setBusy(false);
    }
  };

  const onOtpContinue = () => submitOtpVerify(otpCodeString);

  const setOtpDigit = (index: number, char: string) => {
    const d = char.replace(/\D/g, '').slice(-1);
    const next = [...otpBoxes];
    next[index] = d;
    setOtpBoxes(next);
    if (d && index < OTP_LEN - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const onOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otpBoxes[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const onProfileSubmit = profileForm.handleSubmit(async (values) => {
    if (!tempToken) {
      setError('Session expired. Start again.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const emailTrim = values.email?.trim();
      const res = await authApi.completeProfile({
        temp_token: tempToken,
        name: values.name.trim(),
        email: emailTrim === '' ? undefined : emailTrim,
        referral_code: values.referral_code?.trim() || undefined,
      });
      await persistSession(res.token, res.user);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msg = err.response?.data?.message;
      const firstField =
        err.response?.data?.errors && Object.values(err.response.data.errors)[0]?.[0];
      setError(firstField ?? msg ?? 'Could not complete sign-up');
    } finally {
      setBusy(false);
    }
  });

  const on2fa = twoFaForm.handleSubmit(async ({ code }) => {
    if (!twoFaTemp) return;
    setError(null);
    setBusy(true);
    try {
      const res = await authApi.verifyTwoFactor(code.trim(), twoFaTemp);
      await persistSession(res.token, res.user);
      router.replace('/(tabs)');
    } catch {
      setError('Invalid 2FA code');
    } finally {
      setBusy(false);
    }
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={[
          styles.root,
          { paddingTop: insets.top + spacing(2), paddingBottom: insets.bottom + spacing(2) },
        ]}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.h1}>
          {step === 'phone' && 'Welcome'}
          {step === 'otp' && 'Enter OTP'}
          {step === 'profile' && 'Almost there'}
          {step === '2fa' && 'Two-factor auth'}
        </Text>
        <Text style={styles.muted}>
          {step === 'phone' && 'Sign in with your mobile number — no password.'}
          {step === 'otp' && `We sent a code to +91 ${phoneDigits}.`}
          {step === 'profile' && 'Add your name. Email and referral are optional.'}
          {step === '2fa' && 'Enter the code from your authenticator app.'}
        </Text>

        {step === 'phone' && (
          <>
            <Controller
              control={phoneForm.control}
              name="mobile"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <Input
                  label="Mobile number"
                  value={value}
                  onChangeText={(t) => onChange(normalizeIndianMobile(t))}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  placeholder="9876543210"
                  maxLength={15}
                  error={fieldState.error?.message}
                />
              )}
            />
          </>
        )}

        {step === 'otp' && (
          <View style={styles.otpRow}>
            {otpBoxes.map((digit, i) => (
              <TextInput
                key={i}
                ref={(r) => {
                  otpRefs.current[i] = r;
                }}
                style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(t) => setOtpDigit(i, t)}
                onKeyPress={({ nativeEvent }) => onOtpKeyPress(i, nativeEvent.key)}
                selectTextOnFocus
              />
            ))}
          </View>
        )}

        {step === 'profile' && (
          <>
            <Controller
              control={profileForm.control}
              name="name"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <Input
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
                <Input
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
                <Input
                  label="Referral code (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="characters"
                  error={fieldState.error?.message}
                />
              )}
            />
          </>
        )}

        {step === '2fa' && (
          <Controller
            control={twoFaForm.control}
            name="code"
            render={({ field: { onChange, value } }) => (
              <Input label="Authenticator code" value={value} onChangeText={onChange} keyboardType="number-pad" />
            )}
          />
        )}

        {error ? <Text style={styles.err}>{error}</Text> : null}

        {step === 'phone' && <Button title="Continue" fullWidth onPress={onSendOtp} loading={busy} />}
        {step === 'otp' && (
          <>
            <Button title="Continue" fullWidth onPress={onOtpContinue} loading={busy} />
            <Pressable
              style={({ pressed }) => [styles.linkWrap, pressed && { opacity: 0.7 }]}
              onPress={onResendOtp}
              disabled={resendIn > 0 || busy}
            >
              <Text style={[styles.link, resendIn > 0 && styles.linkDisabled]}>
                {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.linkWrap, pressed && { opacity: 0.7 }]}
              onPress={() => {
                setStep('phone');
                setOtpBoxes(Array(OTP_LEN).fill(''));
              }}
            >
              <Text style={styles.linkMuted}>Change number</Text>
            </Pressable>
          </>
        )}
        {step === 'profile' && (
          <Button title="Complete sign-up" fullWidth onPress={onProfileSubmit} loading={busy} />
        )}
        {step === '2fa' && <Button title="Verify" fullWidth onPress={on2fa} loading={busy} />}

        <Pressable
          style={({ pressed }) => [styles.linkWrap, pressed && { opacity: 0.7 }]}
          onPress={() => {
            setGuest(true);
            router.replace('/(tabs)');
          }}
        >
          <Text style={styles.linkMuted}>Browse without account</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing(2),
  },
  logo: { width: 120, height: 56, alignSelf: 'center', marginBottom: spacing(2) },
  h1: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing(0.75),
  },
  muted: { color: colors.textMuted, marginBottom: spacing(2) },
  err: { color: colors.danger, marginBottom: spacing(1) },
  linkWrap: { marginTop: spacing(1.5), alignItems: 'center' },
  link: { color: colors.primary, fontSize: 15 },
  linkDisabled: { color: colors.textMuted },
  linkMuted: { color: colors.textMuted, fontSize: 14 },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing(2),
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  otpBoxFilled: {
    borderColor: colors.primary,
  },
});
