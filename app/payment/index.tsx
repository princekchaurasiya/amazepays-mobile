import { Header } from '@/components/common/Header';
import { colors, spacing } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

export default function PaymentWebViewScreen() {
  const { url, orderId } = useLocalSearchParams<{ url: string; orderId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const doneRef = useRef(false);

  const uri = Array.isArray(url) ? url[0] : url;
  const oid = Array.isArray(orderId) ? orderId[0] : orderId;

  const maybeComplete = (navUrl: string) => {
    if (doneRef.current) return;
    const u = navUrl.toLowerCase();
    if (
      u.includes('/payment/return') ||
      u.includes('payment/success') ||
      u.includes('success') ||
      u.includes('status=success')
    ) {
      doneRef.current = true;
      if (oid) router.replace(`/order/${oid}`);
      else router.replace('/(tabs)/orders');
      return;
    }
    if (u.includes('/payment/cancel') || u.includes('cancel')) {
      doneRef.current = true;
      router.replace('/(tabs)/orders');
    }
  };

  if (!uri) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Header title="Payment" onBack={() => router.back()} />
        <Text style={styles.err}>Missing payment URL</Text>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <Header title="Payment" onBack={() => router.replace('/(tabs)/orders')} />
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
      <WebView
        source={{ uri }}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(nav) => maybeComplete(nav.url)}
        onShouldStartLoadWithRequest={(req) => {
          maybeComplete(req.url);
          return true;
        }}
        style={styles.flex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  root: { flex: 1, backgroundColor: colors.background },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    pointerEvents: 'none',
  },
  err: { color: colors.danger, padding: spacing(2) },
});
