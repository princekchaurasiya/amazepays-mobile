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
import { Ionicons } from '@expo/vector-icons';
import {
  Platform,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import type { Product } from '@/types/models';

/** Native header logo; width capped vs screen so narrow phones still leave room for search. */
const LOGO_ASPECT = 132 / 40;

export default function HomeScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const [categoryId, setCategoryId] = useState<number | undefined>();
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

  const logoSize = useMemo(() => {
    const w = Math.min(128, Math.round(windowWidth * 0.3));
    return { width: w, height: Math.round(w / LOGO_ASPECT) };
  }, [windowWidth]);

  const listHeader = (
    <View className="bg-surface">
      <View style={{ height: spacing(1) }} />
      <HomeHeroCarousel slides={heroSlides ?? []} />
      <HomeCategoryStrip
        categories={catData ?? []}
        selectedId={categoryId}
        onSelect={setCategoryId}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <View
        className="border-b border-border bg-surface"
        style={[
          Platform.select({
            ios: {
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.08,
              shadowRadius: 14,
            },
            android: { elevation: 6 },
            default: {},
          }),
        ]}
      >
        <View className="flex-row items-center px-2 py-2">
          <Image
            source={require('../../assets/logo.png')}
            style={[{ flexShrink: 0, marginRight: spacing(0.75) }, logoSize]}
            contentFit="contain"
          />
          <View
            className="flex-1 flex-row items-center rounded-full border border-border bg-surface2"
            style={[
              Platform.select({
                ios: {
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.06,
                  shadowRadius: 10,
                },
                android: { elevation: 2 },
                default: {},
              }),
            ]}
          >
            <View className="pl-4 pr-2">
              <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            </View>
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
              className="flex-1 py-3 pr-4 text-base text-text"
              style={{ minHeight: 46 }}
            />
          </View>
        </View>
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
