import { Header } from '@/components/common/Header';
import { DenominationPicker } from '@/components/products/DenominationPicker';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/theme';
import { useProduct } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { formatInr } from '@/utils/format';
import { getListImageUrl, getProductTitle, isOutOfStock, parsePrice } from '@/utils/product';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { data: product, isLoading, error } = useProduct(id);
  const addItem = useCartStore((s) => s.addItem);
  const authenticated = useAuthStore((s) => s.isAuthenticated);

  const [denomination, setDenomination] = useState(0);
  const [qty, setQty] = useState(1);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const title = product ? getProductTitle(product) : '';
  const img = product ? getListImageUrl(product) ?? product.resolved?.image_url : undefined;
  const basePrice = product ? parsePrice(product.selling_price ?? product.mrp ?? product.denomination) : 0;

  const presetDenoms = useMemo(() => {
    if (!product?.denomination) return undefined;
    const raw = product.denomination;
    if (Array.isArray(raw)) {
      return raw.map((x) => parsePrice(x)).filter((n) => n > 0);
    }
    const n = parsePrice(raw);
    return n > 0 ? [n] : undefined;
  }, [product]);

  const min = 1;
  const max = 500000;

  useEffect(() => {
    if (!product) return;
    const initial =
      (presetDenoms?.[0] ?? basePrice) > 0 ? (presetDenoms?.[0] ?? basePrice) : min;
    setDenomination(initial);
  }, [product?.id, basePrice, presetDenoms]);

  const activeDenom = denomination > 0 ? denomination : basePrice || min;

  if (isLoading || !product) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
        {error ? <Text className="mt-2 text-danger">Could not load product</Text> : null}
      </View>
    );
  }

  const oos = isOutOfStock(product);
  const total = activeDenom * qty;

  // Responsive hero: keep visual impact but avoid overly tall image on tablets.
  const heroMaxHeight = Math.min(380, Math.round(windowWidth * 0.9));
  const bottomBarHeight = 124;

  const addToCart = () => {
    addItem({
      productId: product.id,
      sku: product.sku,
      name: title,
      imageUrl: img,
      denomination: activeDenom,
      quantity: qty,
    });
    router.push('/checkout');
  };

  const buyNow = () => {
    useCartStore.getState().clearCart();
    addItem({
      productId: product.id,
      sku: product.sku,
      name: title,
      imageUrl: img,
      denomination: activeDenom,
      quantity: qty,
    });
    router.push('/checkout');
  };

  return (
    <View className="flex-1 bg-background">
      <Header title="Product" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: bottomBarHeight + insets.bottom + spacing(3),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ position: 'relative' }}>
          {img ? (
            <Image
              source={{ uri: img }}
              style={{ width: '100%', aspectRatio: 1.2, maxHeight: heroMaxHeight }}
              contentFit="cover"
            />
          ) : (
            <View style={{ width: '100%', aspectRatio: 1.2, maxHeight: heroMaxHeight }} className="bg-surface" />
          )}
          {oos ? (
            <View
              style={{
                position: 'absolute',
                top: spacing(1.5),
                right: spacing(1.5),
                backgroundColor: 'rgba(0,0,0,0.55)',
                paddingHorizontal: spacing(1.25),
                paddingVertical: spacing(0.75),
                borderRadius: 999,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '800' }}>Out of stock</Text>
            </View>
          ) : null}
        </View>

        <View className="px-4">
          <Text className="mt-3 text-[24px] font-extrabold text-text" numberOfLines={3}>
            {title}
          </Text>

          <View className="mt-2 flex-row items-end justify-between">
            <View>
              <Text className="text-2xl font-extrabold text-primary">{formatInr(activeDenom)}</Text>
              {product.discount_percentage ? (
                <View className="mt-1 self-start rounded-full bg-success-muted-bg px-3 py-1">
                  <Text className="text-xs font-extrabold text-success">
                    Save {String(product.discount_percentage)}%
                  </Text>
                </View>
              ) : null}
            </View>
            <View className="items-end">
              <Text className="text-xs text-text-muted">Total</Text>
              <Text className="text-lg font-extrabold text-text">{formatInr(total)}</Text>
            </View>
          </View>

          <View className="mt-4 rounded-2xl border border-border bg-surface p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-bold text-text">Amount</Text>
                <Text className="mt-0.5 text-sm text-text-muted">
                  {presetDenoms?.length ? 'Pick a denomination' : 'Enter a custom amount'}
                </Text>
              </View>
              <Button title="Choose" variant="outline" onPress={() => setPickerOpen(true)} />
            </View>

            <View className="mt-4 h-px bg-border" />

            <View className="mt-4 flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-bold text-text">Quantity</Text>
                <Text className="mt-0.5 text-sm text-text-muted">Max 50 per order</Text>
              </View>
              <View className="flex-row items-center">
                <Pressable
                  onPress={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface2"
                  style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
                >
                  <Text className="text-[20px] font-extrabold text-text">−</Text>
                </Pressable>
                <View className="mx-3 min-w-[44px] items-center">
                  <Text className="text-lg font-extrabold text-text">{qty}</Text>
                </View>
                <Pressable
                  onPress={() => setQty((q) => Math.min(50, q + 1))}
                  className="h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface2"
                  style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
                >
                  <Text className="text-[20px] font-extrabold text-text">+</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View className="mt-4 rounded-2xl border border-border bg-surface p-4">
            <Pressable
              onPress={() => setRedeemOpen((v) => !v)}
              className="flex-row items-center justify-between"
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <Text className="text-base font-extrabold text-text">How to redeem</Text>
              <Ionicons
                name={redeemOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
            {redeemOpen ? (
              <Text className="mt-2 leading-6 text-text-muted">
                {product.resolved?.how_to_redeem ?? product.how_to_redeem ?? '—'}
              </Text>
            ) : null}

            <View className="mt-4 h-px bg-border" />

            <Pressable
              onPress={() => setTermsOpen((v) => !v)}
              className="mt-4 flex-row items-center justify-between"
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <Text className="text-base font-extrabold text-text">Terms & conditions</Text>
              <Ionicons
                name={termsOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
            {termsOpen ? (
              <Text className="mt-2 leading-6 text-text-muted">
                {product.resolved?.terms ?? product.terms_and_conditions ?? '—'}
              </Text>
            ) : null}
          </View>

          {!authenticated ? (
            <View className="mt-4 rounded-2xl border border-border bg-surface2 p-4">
              <Text className="text-sm font-semibold text-text-muted">
                You can continue as guest. Sign in at checkout to complete your purchase faster next time.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky bottom CTA */}
      <SafeAreaView
        edges={['bottom']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: -8 },
            },
            android: { elevation: 10 },
            default: {},
          }),
        }}
      >
        <View style={{ paddingTop: spacing(1.25), paddingHorizontal: spacing(2), paddingBottom: spacing(1.25) }}>
          <View className="mb-2 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-text-muted">Pay</Text>
              <Text className="text-lg font-extrabold text-text">{formatInr(total)}</Text>
            </View>
            {oos ? (
              <View className="rounded-full bg-danger-muted-bg px-3 py-1.5">
                <Text className="text-xs font-extrabold text-danger">Unavailable</Text>
              </View>
            ) : null}
          </View>

          <View className="flex-row gap-2">
            <View style={{ flex: 1 }}>
              <Button title="Add to cart" fullWidth disabled={oos} onPress={addToCart} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Buy now" variant="secondary" fullWidth disabled={oos} onPress={buyNow} />
            </View>
          </View>
        </View>
      </SafeAreaView>

      <DenominationPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        min={min}
        max={max}
        value={activeDenom}
        denominations={presetDenoms}
        onConfirm={setDenomination}
      />
    </View>
  );
}
