/* eslint-env node */
/** @type {import('expo/config').ExpoConfig} */
export default ({ config }) => ({
  ...config,
  name: 'AmazePays',
  slug: 'amazepays',
  version: '1.0.0',
  orientation: 'portrait',
  /** Same asset as web `public/images/logo.png` (copied into `assets/logo.png`). */
  icon: './assets/logo.png',
  userInterfaceStyle: 'light',
  scheme: 'amazepays',
  newArchEnabled: true,
  splash: {
    image: './assets/logo.png',
    resizeMode: 'contain',
    backgroundColor: '#f9fafb',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.amazepays.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/logo.png',
      backgroundColor: '#f9fafb',
    },
    package: 'com.amazepays.app',
    edgeToEdgeEnabled: true,
    // Allow http:// (cleartext) API calls during development on Android.
    usesCleartextTraffic: true,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: ['expo-router', 'expo-notifications', 'expo-secure-store', 'expo-font'],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? '',
    },
  },
  experiments: {
    typedRoutes: true,
  },
});
