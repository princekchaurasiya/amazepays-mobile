import { ProductList } from '@/components/products/ProductList';
import { EmptyState } from '@/components/common/EmptyState';
import { useProductList } from '@/hooks/useProducts';
import { colors, spacing } from '@/theme';
import type { Product } from '@/types/models';
import { cn } from '@/utils/cn';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function paramToString(q: string | string[] | undefined): string {
  if (q == null) return '';
  return Array.isArray(q) ? (q[0] ?? '') : q;
}

function paramToOptionalInt(q: string | string[] | undefined): number | undefined {
  const s = paramToString(q).trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export default function BrowseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    q?: string | string[];
    category_id?: string | string[];
    brand_id?: string | string[];
  }>();
  const qParam = paramToString(params.q);
  const categoryIdParam = paramToOptionalInt(params.category_id);
  const brandIdParam = paramToOptionalInt(params.brand_id);

  const [search, setSearch] = useState(qParam);
  const [debouncedSearch, setDebouncedSearch] = useState(qParam.trim());
  const inputRef = useRef<TextInput | null>(null);

  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const next = paramToString(params.q);
    if (next) {
      setSearch(next);
      setDebouncedSearch(next.trim());
    }
  }, [params.q]);

  const debounce = useMemo(() => {
    let timer: ReturnType<typeof setTimeout>;
    return (text: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => setDebouncedSearch(text.trim()), 400);
    };
  }, []);

  const query = useProductList({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(categoryIdParam != null ? { category_id: categoryIdParam } : {}),
    ...(brandIdParam != null ? { brand_id: brandIdParam } : {}),
    per_page: 20,
  });

  const products = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data?.pages]
  );

  const onProductPress = (p: Product) => router.push(`/product/${p.id}`);

  const isSearching = debouncedSearch.length > 0;
  const isLoadingFirstPage = query.isFetching && !query.isFetchingNextPage && products.length === 0;

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });
  const lift = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -1],
  });
  const scale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.01],
  });

  const clearSearch = () => {
    setSearch('');
    setDebouncedSearch('');
    inputRef.current?.focus();
  };

  const resultsHeader = (
    <View className="px-4 pb-1 pt-2">
      {isSearching ? (
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-text-muted">
            Results for{' '}
            <Text className="font-bold text-text">
              “{debouncedSearch.length > 28 ? `${debouncedSearch.slice(0, 28)}…` : debouncedSearch}”
            </Text>
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="rounded-full border border-border bg-surface px-2.5 py-1">
              <Text className="text-xs font-bold text-text">{products.length}</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text className="text-sm text-text-muted">Browse all gift cards</Text>
      )}

      {(categoryIdParam != null || brandIdParam != null) && (
        <View className="mt-2 flex-row flex-wrap gap-2">
          {categoryIdParam != null ? (
            <View className="rounded-full bg-surface2 px-3 py-1.5">
              <Text className="text-xs font-semibold text-text-muted">Category #{categoryIdParam}</Text>
            </View>
          ) : null}
          {brandIdParam != null ? (
            <View className="rounded-full bg-surface2 px-3 py-1.5">
              <Text className="text-xs font-semibold text-text-muted">Brand #{brandIdParam}</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );

  return (
    <View
      className={cn('flex-1 bg-background')}
      style={{ paddingTop: Platform.OS === 'android' ? spacing(1) : insets.top + spacing(1) }}
    >
      <View className="px-4 pb-2">
        <Animated.View
          style={[
            {
              transform: [{ translateY: lift }, { scale }],
              borderColor,
              borderWidth: 1,
              borderRadius: 16,
              backgroundColor: colors.surface,
              paddingHorizontal: spacing(1.25),
              paddingVertical: spacing(0.75),
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing(1),
              ...Platform.select({
                ios: {
                  shadowColor: colors.primary,
                  shadowOpacity: 0.08,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 10 },
                },
                android: { elevation: 3 },
                default: {},
              }),
            },
          ]}
        >
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            ref={(r) => {
              inputRef.current = r;
            }}
            placeholder="Search gift cards…"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={(t) => {
              setSearch(t);
              debounce(t);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onFocus={() => {
              Animated.timing(focusAnim, {
                toValue: 1,
                duration: 160,
                useNativeDriver: false,
              }).start();
            }}
            onBlur={() => {
              Animated.timing(focusAnim, {
                toValue: 0,
                duration: 180,
                useNativeDriver: false,
              }).start();
            }}
            onSubmitEditing={() => setDebouncedSearch(search.trim())}
            style={{
              flex: 1,
              minHeight: 40,
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
            }}
          />

          {search.trim().length > 0 ? (
            <Pressable
              accessibilityLabel="Clear search"
              onPress={clearSearch}
              hitSlop={12}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </Animated.View>
      </View>
      <ProductList
        variant="rows"
        products={products}
        onProductPress={onProductPress}
        onRefresh={() => query.refetch()}
        refreshing={query.isFetching && !query.isFetchingNextPage}
        ListHeaderComponent={resultsHeader}
        ListEmptyComponent={
          query.isError ? (
            <EmptyState
              title="Couldn't load results"
              description="Pull to refresh or try again."
              actionLabel="Retry"
              onAction={() => void query.refetch()}
            />
          ) : isLoadingFirstPage ? (
            <EmptyState title={isSearching ? 'Searching…' : 'Loading…'} description="Just a moment." />
          ) : isSearching ? (
            <EmptyState
              title="No matches"
              description="Try a different keyword (brand name works best)."
            />
          ) : (
            <EmptyState title="No products" description="Pull to refresh or try again later." />
          )
        }
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
          }
        }}
        loadingMore={query.isFetchingNextPage}
        contentContainerStyle={{ paddingBottom: spacing(2) }}
      />
    </View>
  );
}
