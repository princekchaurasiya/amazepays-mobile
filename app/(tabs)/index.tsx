import { getApiBaseUrl } from '@/api/client';
import { HomeCategoryStrip } from '@/components/categories/HomeCategoryStrip';
import { EmptyState } from '@/components/common/EmptyState';
import { ProductList } from '@/components/products/ProductList';
import { HomeHeroCarousel } from '@/components/home/HomeHeroCarousel';
import { useCategories, useHomeSlides, useProductList } from '@/hooks/useProducts';
import { colors, spacing } from '@/theme';
import type { AxiosError } from 'axios';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Product } from '@/types/models';

/** After this scroll offset, pin a duplicate category strip under the status bar. */
const STICKY_CATEGORIES_AFTER = 88;

/** Native header logo; width capped vs screen so narrow phones still leave room for search. */
const LOGO_ASPECT = 132 / 40;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [scrollY, setScrollY] = useState(0);
  const [homeSearch, setHomeSearch] = useState('');
  const [debouncedHomeSearch, setDebouncedHomeSearch] = useState('');
  const lastBrowsePush = useRef<string>('');
  const { data: catData } = useCategories();
  const { data: heroSlides } = useHomeSlides();

  const debounceSearch = useMemo(() => {
    let timer: ReturnType<typeof setTimeout>;
    return (text: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => setDebouncedHomeSearch(text.trim()), 450);
    };
  }, []);

  useEffect(() => {
    const t = debouncedHomeSearch;
    if (t.length < 2 || t === lastBrowsePush.current) return;
    lastBrowsePush.current = t;
    router.push({ pathname: '/(tabs)/browse', params: { q: t } });
  }, [debouncedHomeSearch, router]);

  const submitHomeSearch = () => {
    const t = homeSearch.trim();
    if (!t) return;
    lastBrowsePush.current = t;
    router.push({ pathname: '/(tabs)/browse', params: { q: t } });
  };

  const query = useProductList(
    categoryId ? { category_id: categoryId, per_page: 20 } : { per_page: 20 }
  );

  const products = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data?.pages]
  );

  const catalogErrorDescription = useMemo(() => {
    if (!query.isError || !query.error) {
      return '';
    }
    const e = query.error as AxiosError<{ message?: string }>;
    const status = e.response?.status;
    let hint: string;
    if (status === 404) {
      hint =
        '404 means the URL is wrong (not your Laravel API). The app calls GET /catalog on top of EXPO_PUBLIC_API_URL.\n\n' +
        'Fix .env in amazepays-mobile, then restart Expo (npx expo start -c):\n' +
        '• php artisan serve → http://YOUR_PC_IP:8000/api/v1\n' +
        '• XAMPP (htdocs/amazepays) → http://YOUR_PC_IP/amazepays/public/api/v1\n' +
        '• Android emulator + artisan → http://10.0.2.2:8000/api/v1\n\n' +
        'Test in the device browser: paste your base + /health (should return JSON ok).';
    } else if (e.code === 'ERR_NETWORK' || e.message === 'Network Error') {
      hint =
        'Network error — phone/emulator could not reach your PC. Same Wi‑Fi, firewall, and correct IP/port in .env.';
    } else {
      hint =
        (e.response?.data as { message?: string } | undefined)?.message ||
        e.message ||
        'Request failed.';
    }
    return `${hint}\n\nCurrent API base: ${getApiBaseUrl()}`;
  }, [query.isError, query.error]);

  const onProductPress = (p: Product) => {
    router.push(`/product/${p.id}`);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(e.nativeEvent.contentOffset.y);
  };

  const showStickyCategories = scrollY > STICKY_CATEGORIES_AFTER;

  const logoSize = useMemo(() => {
    const w = Math.min(128, Math.round(windowWidth * 0.3));
    return { width: w, height: Math.round(w / LOGO_ASPECT) };
  }, [windowWidth]);

  const listHeader = (
    <View style={styles.headerBlock}>
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + spacing(1),
            paddingLeft: Math.max(insets.left, 4),
            paddingRight: Math.max(insets.right, spacing(2)),
          },
        ]}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={[styles.headerLogo, logoSize]}
          contentFit="contain"
        />
        <TextInput
          accessibilityLabel="Search gift cards"
          placeholder="Search gift cards…"
          placeholderTextColor={colors.textMuted}
          value={homeSearch}
          onChangeText={(t) => {
            setHomeSearch(t);
            if (!t.trim()) {
              lastBrowsePush.current = '';
            }
            debounceSearch(t);
          }}
          onSubmitEditing={submitHomeSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.searchInput}
        />
      </View>
      <View style={styles.navDivider} />
      <View style={styles.spacerSm} />
      <HomeHeroCarousel slides={heroSlides ?? []} />
      <HomeCategoryStrip
        categories={catData ?? []}
        selectedId={categoryId}
        onSelect={setCategoryId}
      />
    </View>
  );

  return (
    <View style={styles.root}>
      {showStickyCategories ? (
        <View
          style={[
            styles.stickyBar,
            {
              paddingTop: insets.top + spacing(0.5),
            },
          ]}
        >
          <HomeCategoryStrip
            categories={catData ?? []}
            selectedId={categoryId}
            onSelect={setCategoryId}
          />
        </View>
      ) : null}
      <ProductList
        variant="rows"
        products={products}
        onProductPress={onProductPress}
        onRefresh={() => query.refetch()}
        refreshing={query.isFetching && !query.isFetchingNextPage}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
          }
        }}
        loadingMore={query.isFetchingNextPage}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          query.isLoading ? null : query.isError ? (
            <EmptyState
              title="Couldn't load catalog"
              description={catalogErrorDescription}
              actionLabel="Retry"
              onAction={() => void query.refetch()}
            />
          ) : (
            <EmptyState
              title="No products yet"
              description="Storefront is empty or filters match nothing. Pull to refresh. If the website shows products, check DB: show_product and catalog_audience (B2C/both)."
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerBlock: {
    paddingBottom: spacing(1),
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing(2),
  },
  headerLogo: {
    flexShrink: 0,
    marginRight: 2,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1),
    color: colors.text,
    fontSize: 16,
  },
  spacerSm: { height: spacing(1) },
  /** Hairline + soft drop shadow so the nav feels separated from categories (not flat/congested). */
  navDivider: {
    height: Math.max(StyleSheet.hairlineWidth, 1),
    backgroundColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.09,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
