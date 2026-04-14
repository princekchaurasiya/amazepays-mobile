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
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      <View className="flex-1 items-center justify-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator color={colors.primary} />
        {error ? <Text className="mt-2 text-danger">Could not load product</Text> : null}
      </View>
    );
  }

  const oos = isOutOfStock(product);

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
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <Header title="Product" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing(4) }}>
        {img ? (
          <Image source={{ uri: img }} style={{ width: '100%', aspectRatio: 1.2 }} contentFit="cover" />
        ) : (
          <View className="aspect-[1.2] w-full bg-surface" />
        )}
        <View className="px-4">
          <Text className="mt-2 text-[22px] font-extrabold text-text">{title}</Text>
          <Text className="mt-1 text-xl font-bold text-primary">{formatInr(activeDenom)}</Text>
          {product.discount_percentage ? (
            <Text className="mt-1 text-success">
              {String(product.discount_percentage)}% off
            </Text>
          ) : null}

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-text-muted">Amount</Text>
            <Button title="Choose" variant="outline" onPress={() => setPickerOpen(true)} />
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-text-muted">Quantity</Text>
            <View className="flex-row items-center">
              <Pressable onPress={() => setQty((q) => Math.max(1, q - 1))} className="h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface">
                <Text className="text-[20px] text-text">−</Text>
              </Pressable>
              <Text className="mx-3 text-lg font-bold text-text">{qty}</Text>
              <Pressable onPress={() => setQty((q) => Math.min(50, q + 1))} className="h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface">
                <Text className="text-[20px] text-text">+</Text>
              </Pressable>
            </View>
          </View>

          <Pressable onPress={() => setRedeemOpen(!redeemOpen)}>
            <Text className="mt-3 font-semibold text-primary">How to redeem {redeemOpen ? '▼' : '▶'}</Text>
          </Pressable>
          {redeemOpen ? (
            <Text className="mt-1.5 leading-6 text-text-muted">
              {product.resolved?.how_to_redeem ?? product.how_to_redeem ?? '—'}
            </Text>
          ) : null}

          <Pressable onPress={() => setTermsOpen(!termsOpen)}>
            <Text className="mt-3 font-semibold text-primary">Terms & conditions {termsOpen ? '▼' : '▶'}</Text>
          </Pressable>
          {termsOpen ? (
            <Text className="mt-1.5 leading-6 text-text-muted">
              {product.resolved?.terms ?? product.terms_and_conditions ?? '—'}
            </Text>
          ) : null}

          <Button
            title="Add to cart"
            fullWidth
            disabled={oos}
            onPress={addToCart}
            className="mt-4"
          />
          <Button
            title="Buy now"
            variant="secondary"
            fullWidth
            disabled={oos}
            onPress={buyNow}
            className="mt-2"
          />

          {!authenticated ? (
            <Text className="mt-4 text-center text-text-muted">Sign in at checkout to complete your purchase.</Text>
          ) : null}
        </View>
      </ScrollView>

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
