import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { colors, spacing } from '@/theme';
import { useOrdersList } from '@/hooks/useOrders';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, formatInr } from '@/utils/format';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: (Platform.OS === 'ios' ? insets.top : 0) + spacing(2) }}
      >
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
      <View
        className="flex-1 items-center justify-center"
        style={{ paddingTop: Platform.OS === 'ios' ? insets.top : 0 }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: (Platform.OS === 'ios' ? insets.top : 0) + spacing(1) }}
    >
      <Text className="mb-1 px-4 text-2xl font-extrabold text-text">Orders</Text>
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
          <Pressable onPress={() => router.push(`/order/${item.id}`)}>
            <Card className="mb-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-bold text-text">#{item.order_number ?? item.id}</Text>
                <Badge label={String(item.status ?? item.order_status ?? '—')} tone="default" />
              </View>
              <Text className="mt-1.5 text-text-muted">{item.product_name ?? 'Product'}</Text>
              <Text className="mt-1 text-xs text-text-muted">{formatDateTime(item.created_at)}</Text>
              <Text className="mt-1.5 font-extrabold text-primary">{formatInr(item.grand_total)}</Text>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}
