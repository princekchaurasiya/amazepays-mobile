import { authApi } from '@/api/auth';
import { captureException } from '@/sentry';
import type { User } from '@/types/models';
import type { AxiosError } from 'axios';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const RESEND_SECONDS = 30;

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

export type VerifyOtpResult =
  | { kind: 'logged_in'; token: string; user: User }
  | { kind: 'needs_profile'; temp_token: string }
  | { kind: '2fa_required'; temp_token: string }
  | { kind: 'error'; message: string };

type AuthFlowContextValue = {
  busy: boolean;
  error: string | null;
  setError: (msg: string | null) => void;
  resendIn: number;
  profileTempToken: string | null;
  twoFaTempToken: string | null;
  clearPostOtpState: () => void;
  sendOtp: (mobileDigits: string) => Promise<boolean>;
  resendOtp: (mobileDigits: string) => Promise<boolean>;
  verifyOtp: (mobileDigits: string, code: string) => Promise<VerifyOtpResult>;
};

const AuthFlowContext = createContext<AuthFlowContextValue | null>(null);

export function AuthFlowProvider({ children }: { children: ReactNode }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [profileTempToken, setProfileTempToken] = useState<string | null>(null);
  const [twoFaTempToken, setTwoFaTempToken] = useState<string | null>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const clearPostOtpState = useCallback(() => {
    setProfileTempToken(null);
    setTwoFaTempToken(null);
  }, []);

  const sendOtp = useCallback(async (mobileDigits: string) => {
    setError(null);
    setBusy(true);
    try {
      const r = await authApi.sendOtp(mobileDigits, 'login');
      if (!r.success) {
        setError(r.message ?? 'Could not send OTP');
        return false;
      }
      setResendIn(RESEND_SECONDS);
      return true;
    } catch (e) {
      console.error('sendOtp failed', e);
      captureException(e);
      setError(getApiErrorMessage(e, 'Could not send OTP'));
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const resendOtp = useCallback(
    async (mobileDigits: string) => {
      if (resendIn > 0 || !mobileDigits) return false;
      setError(null);
      setBusy(true);
      try {
        const r = await authApi.sendOtp(mobileDigits, 'login');
        if (!r.success) {
          setError(r.message ?? 'Could not resend OTP');
          return false;
        }
        setResendIn(RESEND_SECONDS);
        return true;
      } catch (e) {
        console.error('resendOtp failed', e);
        captureException(e);
        setError(getApiErrorMessage(e, 'Could not resend OTP'));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [resendIn]
  );

  const verifyOtp = useCallback(async (mobileDigits: string, code: string): Promise<VerifyOtpResult> => {
    setError(null);
    setBusy(true);
    try {
      const result = await authApi.verifyOtp(mobileDigits, code);
      if (!result.ok) {
        if (result.status === 403) {
          return { kind: 'error', message: result.data?.message ?? 'Account restricted' };
        }
        if (result.status === 423) {
          return { kind: 'error', message: result.data?.message ?? 'Account locked' };
        }
        if (result.status === 422) {
          const msg =
            result.data?.errors?.otp?.[0] ?? result.data?.message ?? 'Invalid or expired OTP';
          return { kind: 'error', message: msg };
        }
        return { kind: 'error', message: result.data?.message ?? 'Verification failed' };
      }

      const { data, status } = result;
      if (status === 202 && 'action' in data && data.action === '2fa_required' && 'temp_token' in data) {
        setTwoFaTempToken(data.temp_token);
        return { kind: '2fa_required', temp_token: data.temp_token };
      }
      if ('action' in data && data.action === 'logged_in' && 'token' in data) {
        return { kind: 'logged_in', token: data.token, user: data.user };
      }
      if ('action' in data && data.action === 'needs_profile' && 'temp_token' in data) {
        setProfileTempToken(data.temp_token);
        return { kind: 'needs_profile', temp_token: data.temp_token };
      }
      return { kind: 'error', message: 'Unexpected response' };
    } catch {
      return { kind: 'error', message: 'Verification failed' };
    } finally {
      setBusy(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      busy,
      error,
      setError,
      resendIn,
      profileTempToken,
      twoFaTempToken,
      clearPostOtpState,
      sendOtp,
      resendOtp,
      verifyOtp,
    }),
    [
      busy,
      error,
      resendIn,
      profileTempToken,
      twoFaTempToken,
      clearPostOtpState,
      sendOtp,
      resendOtp,
      verifyOtp,
    ]
  );

  return <AuthFlowContext.Provider value={value}>{children}</AuthFlowContext.Provider>;
}

export function useAuthFlow() {
  const ctx = useContext(AuthFlowContext);
  if (!ctx) {
    throw new Error('useAuthFlow must be used within AuthFlowProvider');
  }
  return ctx;
}
