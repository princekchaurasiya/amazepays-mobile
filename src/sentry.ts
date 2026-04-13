import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const dsn =
  process.env.EXPO_PUBLIC_SENTRY_DSN ??
  (Constants.expoConfig?.extra?.sentryDsn as string | undefined);

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.2,
  });
}

export function captureException(error: unknown) {
  if (dsn) Sentry.captureException(error);
}
