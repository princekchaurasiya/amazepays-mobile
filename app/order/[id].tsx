import { Header } from '@/components/common/Header';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, spacing } from '@/theme';
import { useOrder } from '@/hooks/useOrders';
import { formatDateTime, formatInr } from '@/utils/format';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: order, isLoading, error } = useOrder(id);

  if (isLoading || !order) {
    return (
      <View style={[styles.center, { paddingTop: Platform.OS === 'ios' ? insets.top : 0 }]}>
        <ActivityIndicator color={colors.primary} />
        {error ? <Text style={styles.err}>Order not found</Text> : null}
      </View>
    );
  }

  const done =
    String(order.status ?? '').toLowerCase() === 'completed' ||
    String(order.order_status ?? '').toUpperCase() === 'COMPLETE';

  return (
    <View style={[styles.root, { paddingTop: Platform.OS === 'ios' ? insets.top : 0 }]}>
      <Header title="Order" onBack={() => router.back()} />
      <View style={{ padding: spacing(2) }}>
        <Card>
          <View style={styles.row}>
            <Text style={styles.h1}>#{order.order_number ?? order.id}</Text>
            <Badge label={String(order.status ?? order.order_status ?? '—')} tone="default" />
          </View>
          <Text style={styles.meta}>{formatDateTime(order.created_at)}</Text>
          <Text style={styles.prod}>{order.product_name}</Text>
          <Text style={styles.amount}>{formatInr(order.grand_total)}</Text>
          <Text style={styles.meta}>Payment: {order.payment_method}</Text>
        </Card>

        {done ? (
          <Button
            title="View voucher"
            fullWidth
            style={{ marginTop: spacing(2) }}
            onPress={() => router.push(`/voucher/${order.id}`)}
          />
        ) : (
          <Text style={styles.wait}>
            Complete payment to receive your voucher. Check orders list for updates.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  err: { color: colors.danger, marginTop: spacing(1) },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  h1: { color: colors.text, fontSize: 20, fontWeight: '800' },
  meta: { color: colors.textMuted, marginTop: spacing(0.75) },
  prod: { color: colors.text, fontWeight: '600', marginTop: spacing(1) },
  amount: { color: colors.primary, fontSize: 18, fontWeight: '800', marginTop: spacing(0.75) },
  wait: { color: colors.textMuted, marginTop: spacing(2), textAlign: 'center' },
});
