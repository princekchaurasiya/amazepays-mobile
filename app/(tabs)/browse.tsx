import { ProductList } from '@/components/products/ProductList';
import { Input } from '@/components/ui/Input';
import { useProductList } from '@/hooks/useProducts';
import { colors, spacing } from '@/theme';
import type { Product } from '@/types/models';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BrowseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const debounce = useMemo(() => {
    let timer: ReturnType<typeof setTimeout>;
    return (text: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => setDebouncedSearch(text.trim()), 400);
    };
  }, []);

  const query = useProductList(
    debouncedSearch ? { search: debouncedSearch, per_page: 20 } : { per_page: 20 }
  );

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
