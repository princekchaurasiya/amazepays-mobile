import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { colors, spacing } from '@/theme';
import { useOrdersList } from '@/hooks/useOrders';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, formatInr } from '@/utils/format';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Order } from '@/types/models';

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const authenticated = useAuthStore((s) => s.isAuthenticated);

  const query = useOrdersList();

  const orders = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data?.pages]
  );

  if (!authenticated) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing(2) }]}>
        <EmptyState
          title="Sign in to see orders"
          description="Create an account or sign in to view your purchase history."
          actionLabel="Sign in"
          onAction={() => router.replace('/(auth)/login')}
        />
      </View>
    );
  }

  if (query.isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing(1) }]}>
      <Text style={styles.h1}>Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(o) => String(o.id)}
        contentContainerStyle={{ padding: spacing(2), flexGrow: 1 }}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
          }
        }}
        refreshing={query.isRefetching}
        onRefresh={() => query.refetch()}
        ListEmptyComponent={
          <EmptyState title="No orders yet" description="Your completed purchases appear here." />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/order/${item.id}`)}
          >
            <Card style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.orderNo}>#{item.order_number ?? item.id}</Text>
                <Badge label={String(item.status ?? item.order_status ?? '—')} tone="default" />
              </View>
              <Text style={styles.prod}>{item.product_name ?? 'Product'}</Text>
              <Text style={styles.meta}>{formatDateTime(item.created_at)}</Text>
              <Text style={styles.amount}>{formatInr(item.grand_total)}</Text>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  h1: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    paddingHorizontal: spacing(2),
    marginBottom: spacing(0.5),
  },
  card: { marginBottom: spacing(1.5) },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNo: { color: colors.text, fontWeight: '700', fontSize: 16 },
  prod: { color: colors.textMuted, marginTop: spacing(0.75) },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  amount: { color: colors.primary, fontWeight: '800', marginTop: spacing(0.75) },
});
