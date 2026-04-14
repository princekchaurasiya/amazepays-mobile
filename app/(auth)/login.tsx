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
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        className="flex-1 bg-background px-4"
        style={[
          { paddingTop: insets.top + spacing(2), paddingBottom: insets.bottom + spacing(2) },
        ]}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: 120, height: 56, alignSelf: 'center', marginBottom: spacing(2) }}
          contentFit="contain"
        />
        <Text className="mb-1.5 text-[28px] font-extrabold text-text">
          {step === 'phone' && 'Welcome'}
          {step === 'otp' && 'Enter OTP'}
          {step === 'profile' && 'Almost there'}
          {step === '2fa' && 'Two-factor auth'}
        </Text>
        <Text className="mb-4 text-text-muted">
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
          <View className="mb-4 flex-row justify-between gap-2">
            {otpBoxes.map((digit, i) => (
              <TextInput
                key={i}
                ref={(r) => {
                  otpRefs.current[i] = r;
                }}
                className={`h-12 flex-1 rounded-[10px] border bg-surface text-center text-[20px] font-bold text-text ${
                  digit ? 'border-primary' : 'border-border'
                }`}
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

        {error ? <Text className="mb-2 text-danger">{error}</Text> : null}

        {step === 'phone' && <Button title="Continue" fullWidth onPress={onSendOtp} loading={busy} />}
        {step === 'otp' && (
          <>
            <Button title="Continue" fullWidth onPress={onOtpContinue} loading={busy} />
            <Pressable
              className="mt-3 items-center"
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              onPress={onResendOtp}
              disabled={resendIn > 0 || busy}
            >
              <Text className={`text-[15px] ${resendIn > 0 ? 'text-text-muted' : 'text-primary'}`}>
                {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
              </Text>
            </Pressable>
            <Pressable
              className="mt-3 items-center"
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              onPress={() => {
                setStep('phone');
                setOtpBoxes(Array(OTP_LEN).fill(''));
              }}
            >
              <Text className="text-sm text-text-muted">Change number</Text>
            </Pressable>
          </>
        )}
        {step === 'profile' && (
          <Button title="Complete sign-up" fullWidth onPress={onProfileSubmit} loading={busy} />
        )}
        {step === '2fa' && <Button title="Verify" fullWidth onPress={on2fa} loading={busy} />}

        <Pressable
          className="mt-3 items-center"
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          onPress={() => {
            setGuest(true);
            router.replace('/(tabs)');
          }}
        >
          <Text className="text-sm text-text-muted">Browse without account</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
