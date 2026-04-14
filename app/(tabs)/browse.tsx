import { ProductList } from '@/components/products/ProductList';
import { Input } from '@/components/ui/Input';
import { useProductList } from '@/hooks/useProducts';
import { colors, spacing } from '@/theme';
import type { Product } from '@/types/models';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing(1) }]}>
      <View style={{ paddingHorizontal: spacing(2), marginBottom: spacing(1) }}>
        <Input
          placeholder="Search gift cards..."
          value={search}
          onChangeText={(t) => {
            setSearch(t);
            debounce(t);
          }}
          autoCapitalize="none"
        />
      </View>
      <ProductList
        variant="rows"
        products={products}
        onProductPress={onProductPress}
        onRefresh={() => query.refetch()}
        refreshing={query.isFetching && !query.isFetchingNextPage}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
          }
        }}
        loadingMore={query.isFetchingNextPage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
