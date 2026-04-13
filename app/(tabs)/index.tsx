import { useOffers } from '@/hooks/useOffers';
import { useCategories, useProductList } from '@/hooks/useProducts';
import { ProductList } from '@/components/products/ProductList';
import { EmptyState } from '@/components/common/EmptyState';
import { colors, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Category, Product } from '@/types/models';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const { data: catData } = useCategories();
  const offers = useOffers();

  const query = useProductList(
    categoryId ? { category_id: categoryId, per_page: 20 } : { per_page: 20 }
  );

  const products = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data?.pages]
  );

  const onProductPress = (p: Product) => {
    router.push(`/product/${p.id}`);
  };

  const header = (
    <View style={{ paddingBottom: spacing(1) }}>
      <View style={styles.logoRow}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.headerLogo}
          contentFit="contain"
        />
      </View>
      <Text style={styles.heroTitle}>Gift cards for every occasion</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bannerRow}>
        {(offers.data ?? []).slice(0, 5).map((o) => (
          <View key={o.id} style={styles.banner}>
            <Text style={styles.bannerText}>{o.name}</Text>
            <Text style={styles.bannerSub}>{o.code}</Text>
          </View>
        ))}
        {(!offers.data || offers.data.length === 0) && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Welcome to AmazePays</Text>
            <Text style={styles.bannerSub}>Browse top brands</Text>
          </View>
        )}
      </ScrollView>
      <Text style={styles.sectionLabel}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Pressable
          style={[styles.chip, !categoryId && styles.chipActive]}
          onPress={() => setCategoryId(undefined)}
        >
          <Text style={[styles.chipTxt, !categoryId && styles.chipTxtActive]}>All</Text>
        </Pressable>
        {(catData ?? []).map((c: Category) => (
          <Pressable
            key={c.id}
            style={[styles.chip, categoryId === c.id && styles.chipActive]}
            onPress={() => setCategoryId(c.id)}
          >
            {c.thumbnail ? (
              <Image source={{ uri: c.thumbnail }} style={styles.chipImg} contentFit="cover" />
            ) : null}
            <Text
              style={[
                styles.chipTxt,
                categoryId === c.id && styles.chipTxtActive,
              ]}
            >
              {c.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing(1) }]}>
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
        ListHeaderComponent={header}
        ListEmptyComponent={
          query.isLoading ? null : (
            <EmptyState title="No products yet" description="Pull to refresh or adjust filters." />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  logoRow: { paddingHorizontal: spacing(2), marginBottom: spacing(1) },
  headerLogo: { width: 140, height: 40, alignSelf: 'flex-start' },
  heroTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    paddingHorizontal: spacing(2),
    marginBottom: spacing(1),
  },
  bannerRow: { maxHeight: 100, paddingLeft: spacing(2) },
  banner: {
    width: 220,
    height: 88,
    marginRight: spacing(1),
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing(1.5),
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  bannerText: { color: colors.text, fontWeight: '700', fontSize: 16 },
  bannerSub: { color: colors.primary, marginTop: 4, fontSize: 13 },
  sectionLabel: {
    color: colors.textMuted,
    marginTop: spacing(1),
    marginBottom: spacing(0.75),
    paddingHorizontal: spacing(2),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(1.25),
    paddingVertical: spacing(0.75),
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
    marginLeft: spacing(2),
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: '#0c4a6e' },
  chipTxt: { color: colors.text, fontWeight: '600' },
  chipTxtActive: { color: colors.primary },
  chipImg: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
});
