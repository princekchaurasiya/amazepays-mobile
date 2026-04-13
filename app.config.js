/* eslint-env node */
/** @type {import('expo/config').ExpoConfig} */
export default ({ config }) => ({
  ...config,
  name: 'AmazePays',
  slug: 'amazepays',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'amazepays',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0f172a',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.amazepays.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0f172a',
    },
    package: 'com.amazepays.app',
    edgeToEdgeEnabled: true,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: ['expo-router', 'expo-notifications', 'expo-secure-store'],
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
