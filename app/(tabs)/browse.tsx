import { EmptyState } from '@/components/common/EmptyState';
import { TopAppBar } from '@/components/common/TopAppBar';
import { useProductList, useCategories } from '@/hooks/useProducts';
import { Colors } from '@/constants/colors';
import { colors, layout } from '@/theme';
import type { Product } from '@/types/models';
import { formatInr } from '@/utils/format';
import { getListImageUrl, getProductTitle, isOutOfStock, parsePrice } from '@/utils/product';
import { Ionicons } from '@expo/vector-icons';
import type { AxiosError } from 'axios';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { ms } from 'react-native-size-matters';

const spacing = (n: number) => ms(n * 8);

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

function categorySubtitle(p: Product): string | null {
  const cats = p.categories;
  if (cats?.length) return cats.map((c) => c.name).join(' · ');
  const d = p.description?.trim();
  if (d) return d.length > 48 ? `${d.slice(0, 48)}…` : d;
  return null;
}

function valueRangeLine(p: Product): string {
  const values = [
    parsePrice(p.selling_price),
    parsePrice(p.mrp),
    parsePrice(p.denomination),
  ].filter((n) => n > 0);
  if (values.length === 0) return '—';
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  if (lo === hi) return formatInr(lo);
  return `${formatInr(lo)} - ${formatInr(hi)}`;
}

function brandTitle(p: Product): string {
  return p.brand?.name || getProductTitle(p);
}

function accentBlobColor(productId: number): string {
  const palette = [
    Colors.brand[50],
    Colors.accentColors[50],
    Colors.brand[100],
    Colors.accentColors[100],
  ];
  return palette[Math.abs(productId) % palette.length] ?? Colors.brand[50];
}

function BrowseGiftCard({
  product,
  onPress,
}: {
  product: Product;
  onPress: () => void;
}) {
  const productImages =
    product.images && typeof product.images === 'object'
      ? (product.images as Record<string, unknown>)
      : null;
  const cardBackgroundUrl =
    typeof productImages?.large === 'string' && productImages.large.trim().length > 0
      ? productImages.large
      : undefined;
  const [cardBackgroundErrored, setCardBackgroundErrored] = useState(false);
  useEffect(() => {
    setCardBackgroundErrored(false);
  }, [cardBackgroundUrl]);

  const img = getListImageUrl(product);
  const title = brandTitle(product);
  const sub = categorySubtitle(product);
  const range = valueRangeLine(product);
  const oos = isOutOfStock(product);
  const blob = accentBlobColor(product.id);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          opacity: pressed ? 0.94 : 1,
          marginBottom: spacing(1.75),
        },
      ]}
    >
      {cardBackgroundUrl && !cardBackgroundErrored ? (
        <>
          <Image
            source={{ uri: cardBackgroundUrl }}
            style={styles.cardBackgroundImage}
            contentFit="cover"
            transition={150}
            onError={() => setCardBackgroundErrored(true)}
          />
          <View pointerEvents="none" style={styles.cardBackgroundOverlay} />
        </>
      ) : null}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -spacing(2),
          top: -spacing(2),
          width: ms(120),
          height: ms(120),
          borderRadius: ms(60),
          backgroundColor: blob,
          opacity: 0.85,
        }}
      />
      <View style={styles.cardImageRow}>
        <View style={styles.cardImageShell}>
          {img ? (
            <Image source={{ uri: img }} style={styles.cardImage} contentFit="contain" />
          ) : (
            <Text style={styles.cardImageFallbackText} numberOfLines={1}>
              {title.slice(0, 1).toUpperCase()}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {title}
        </Text>
        {sub ? (
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            {sub}
          </Text>
        ) : null}
        <View style={styles.cardMetaRow}>
          <View>
            <Text style={styles.valueRangeLabel}>
              VALUE RANGE
            </Text>
            <Text style={styles.valueRangeValue}>{range}</Text>
          </View>
          <View pointerEvents="none" style={styles.cardArrowShell}>
            <Ionicons name="arrow-forward" size={ms(22)} color={colors.onPrimary} />
          </View>
        </View>
        {oos ? (
          <Text style={styles.outOfStockText}>Out of stock</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function BrowseScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
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
  const listRef = useRef<FlatList<Product>>(null);

  const { data: categoriesRes } = useCategories();
  const categories = categoriesRes ?? [];

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

  const onProductPress = useCallback((p: Product) => router.push(`/product/${p.id}`), [router]);

  const isSearching = debouncedSearch.length > 0;
  const isLoadingFirstPage = query.isFetching && !query.isFetchingNextPage && products.length === 0;

  const horizontalPad = spacing(2);
  const shellMaxWidth = layout.contentMaxWidth + horizontalPad * 2;
  const listInnerWidth = Math.min(windowWidth, shellMaxWidth) - horizontalPad * 2;
  const numColumns = listInnerWidth >= 480 ? 2 : 1;
  const columnGap = spacing(1.5);

  const setBrowseParams = useCallback(
    (next: { q?: string; category_id?: number }) => {
      const p: Record<string, string> = {};
      const q = (next.q ?? debouncedSearch).trim();
      if (q) p.q = q;
      if (next.category_id != null) p.category_id = String(next.category_id);
      if (brandIdParam != null) p.brand_id = String(brandIdParam);
      router.replace({ pathname: '/(tabs)/browse', params: p });
    },
    [brandIdParam, debouncedSearch, router]
  );

  const clearSearch = () => {
    setSearch('');
    setDebouncedSearch('');
    inputRef.current?.focus();
  };

  const catalogErrorDescription = useMemo(() => {
    if (!query.isError || !query.error) return '';
    const e = query.error as AxiosError<{ message?: string }>;
    return (
      (e.response?.data as { message?: string } | undefined)?.message ||
      e.message ||
      'Request failed.'
    );
  }, [query.isError, query.error]);

  const listHeader = (
    <View style={styles.fullWidth}>
      {(categoryIdParam != null || brandIdParam != null) && (
        <View style={styles.filterChipRow}>
          {categoryIdParam != null ? (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Category filter active</Text>
            </View>
          ) : null}
          {brandIdParam != null ? (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Brand #{brandIdParam}</Text>
            </View>
          ) : null}
        </View>
      )}

      <View style={styles.popularRow}>
        <Text style={styles.popularTitle}>Popular Brands</Text>
        <Pressable
          onPress={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
            else listRef.current?.scrollToEnd({ animated: true });
          }}
          hitSlop={ms(8)}
        >
          <Text style={styles.viewAllText}>View all</Text>
        </Pressable>
      </View>

      {isSearching ? (
        <View style={styles.searchResultsRow}>
          <Text style={styles.searchResultText}>
            Results for{' '}
            <Text style={styles.searchResultQueryText}>
              “{debouncedSearch.length > 32 ? `${debouncedSearch.slice(0, 32)}…` : debouncedSearch}”
            </Text>
            <Text style={styles.searchResultCountText}> · {products.length}</Text>
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.screenRoot}>
      <View style={[styles.topHeaderWrap, { width: '100%', maxWidth: shellMaxWidth }]}>
        <View
          style={{
            paddingTop: Platform.OS === 'android' ? spacing(0.5) : 0,
            paddingHorizontal: horizontalPad,
          }}
        >
          <TopAppBar title="Browse Gift Cards" />
        </View>

        <View style={[styles.stickyFilterWrap, { paddingHorizontal: horizontalPad }]}>
          <View
            style={{
              ...styles.searchContainer,
              paddingVertical: Platform.OS === 'ios' ? spacing(1) : spacing(0.75),
            }}
          >
            <Ionicons name="search-outline" size={ms(20)} color={colors.textMuted} />
            <TextInput
              ref={(r) => {
                inputRef.current = r;
              }}
              placeholder="Search for brands, retailers or food.."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={(t) => {
                setSearch(t);
                debounce(t);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={() => setDebouncedSearch(search.trim())}
              style={styles.searchInput}
            />
            {search.trim().length > 0 ? (
              <Pressable accessibilityLabel="Clear search" onPress={clearSearch} hitSlop={ms(12)}>
                <Ionicons name="close-circle" size={ms(20)} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.categoriesTitle}>
            Categories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: spacing(1.5), gap: spacing(1), paddingRight: spacing(1) }}
          >
            <Pressable
              onPress={() => setBrowseParams({ category_id: undefined })}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing(1),
                paddingHorizontal: spacing(1.75),
                paddingVertical: spacing(1),
                borderRadius: ms(999),
                backgroundColor: categoryIdParam == null ? colors.primary : colors.surface2,
                borderWidth: categoryIdParam == null ? 0 : ms(1),
                borderColor: colors.border,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Ionicons
                name="grid-outline"
                size={ms(18)}
                color={categoryIdParam == null ? colors.onPrimary : colors.primary}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  { color: categoryIdParam == null ? colors.onPrimary : colors.text },
                ]}
              >
                All
              </Text>
            </Pressable>
            {categories.slice(0, 12).map((c) => {
              const active = categoryIdParam === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setBrowseParams({ category_id: c.id })}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing(1),
                    paddingHorizontal: spacing(1.75),
                    paddingVertical: spacing(1),
                    borderRadius: ms(999),
                    backgroundColor: active ? colors.primary : colors.surface2,
                    borderWidth: active ? 0 : ms(1),
                    borderColor: colors.border,
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <Ionicons
                    name="pricetags-outline"
                    size={ms(18)}
                    color={active ? colors.onPrimary : colors.primary}
                  />
                  <Text style={[styles.categoryChipText, { color: active ? colors.onPrimary : colors.text }]} numberOfLines={1}>
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <FlatList<Product>
        ref={listRef}
        key={numColumns}
        style={{ width: '100%', maxWidth: shellMaxWidth }}
        data={products}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={listHeader}
        columnWrapperStyle={numColumns > 1 ? { gap: columnGap } : undefined}
        contentContainerStyle={{
          paddingHorizontal: horizontalPad,
          paddingBottom: spacing(3),
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={!!(query.isFetching && !query.isFetchingNextPage && products.length > 0)}
            onRefresh={() => void query.refetch()}
            progressViewOffset={Platform.OS === 'android' ? 48 : 0}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <View style={numColumns > 1 ? { flex: 1, minWidth: 0 } : undefined}>
            <BrowseGiftCard product={item} onPress={() => onProductPress(item)} />
          </View>
        )}
        ListEmptyComponent={
          query.isError ? (
            <View>
              <EmptyState
                title="Couldn't load results"
                description={catalogErrorDescription || 'Pull to refresh or try again.'}
                actionLabel="Retry"
                onAction={() => void query.refetch()}
              />
            </View>
          ) : isLoadingFirstPage ? (
            <View>
              <EmptyState title={isSearching ? 'Searching…' : 'Loading…'} description="Just a moment." />
            </View>
          ) : isSearching ? (
            <View>
              <EmptyState
                title="No matches"
                description="Try a different keyword (brand name works best)."
              />
            </View>
          ) : (
            <View>
              <EmptyState title="No products" description="Pull to refresh or try again later." />
            </View>
          )
        }
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            void query.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.35}
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <View style={styles.footerLoaderWrap}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  topHeaderWrap: {
    backgroundColor: colors.background,
    zIndex: 10,
    elevation: 2,
  },
  stickyFilterWrap: {
    backgroundColor: colors.background,
  },
  fullWidth: { width: '100%' },
  card: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: ms(18),
    borderWidth: ms(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing(2),
  },
  cardBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardBackgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  cardImageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardImageShell: {
    width: ms(52),
    height: ms(52),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: ms(14),
    backgroundColor: colors.surface2,
  },
  cardImage: { width: ms(44), height: ms(44) },
  cardImageFallbackText: {
    fontSize: ms(20),
    fontWeight: '800',
    color: colors.primary,
  },
  cardBody: {
    marginTop: spacing(1.5),
    paddingRight: spacing(0.25),
  },
  cardTitle: {
    fontSize: ms(20),
    fontWeight: '800',
    color: colors.primary,
  },
  cardSubtitle: {
    marginTop: spacing(0.5),
    fontSize: ms(14),
    fontWeight: '500',
    color: colors.textMuted,
  },
  cardMetaRow: {
    marginTop: spacing(1.25),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueRangeLabel: {
    fontSize: ms(10),
    fontWeight: '700',
    letterSpacing: ms(0.6),
    color: colors.textMuted,
    opacity: 0.75,
  },
  valueRangeValue: {
    marginTop: spacing(0.25),
    fontSize: ms(16),
    fontWeight: '800',
    color: colors.primary,
  },
  cardArrowShell: {
    width: ms(48),
    height: ms(48),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(14),
    backgroundColor: colors.accent,
  },
  outOfStockText: {
    marginTop: spacing(1),
    fontSize: ms(12),
    fontWeight: '700',
    color: colors.danger,
  },
  searchContainer: {
    marginTop: spacing(2),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    borderRadius: ms(999),
    borderWidth: ms(1),
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing(1.75),
  },
  searchInput: {
    minHeight: ms(40),
    flex: 1,
    fontSize: ms(14),
    fontWeight: '400',
    color: colors.text,
  },
  categoriesTitle: {
    marginTop: spacing(2.5),
    fontSize: ms(16),
    fontWeight: '400',
    color: colors.primary,
  },
  categoryChipText: {
    fontSize: ms(12),
    fontWeight: '400',
  },
  filterChipRow: {
    marginBottom: spacing(1),
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  filterChip: {
    borderRadius: ms(999),
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
  },
  filterChipText: {
    fontSize: ms(12),
    fontWeight: '600',
    color: colors.textMuted,
  },
  popularRow: {
    marginTop: spacing(0.5),
    marginBottom: spacing(1),
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  popularTitle: {
    fontSize: ms(16),
    fontWeight: '400',
    color: colors.primary,
  },
  viewAllText: {
    fontSize: ms(14),
    fontWeight: '400',
    color: colors.primaryBright,
  },
  searchResultsRow: { marginBottom: spacing(1) },
  searchResultText: {
    fontSize: ms(14),
    color: colors.textMuted,
  },
  searchResultQueryText: {
    fontSize: ms(14),
    fontWeight: '800',
    color: colors.text,
  },
  searchResultCountText: {
    fontSize: ms(14),
    fontWeight: '700',
    color: colors.textMuted,
  },
  footerLoaderWrap: {
    paddingVertical: spacing(2),
  },
});
