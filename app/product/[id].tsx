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
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.primary} />
        {error ? <Text style={styles.err}>Could not load product</Text> : null}
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
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Header title="Product" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing(4) }}>
        {img ? (
          <Image source={{ uri: img }} style={styles.hero} contentFit="cover" />
        ) : (
          <View style={[styles.hero, styles.ph]} />
        )}
        <View style={{ paddingHorizontal: spacing(2) }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.price}>{formatInr(activeDenom)}</Text>
          {product.discount_percentage ? (
            <Text style={styles.disc}>
              {String(product.discount_percentage)}% off
            </Text>
          ) : null}

          <View style={styles.row}>
            <Text style={styles.lbl}>Amount</Text>
            <Button title="Choose" variant="outline" onPress={() => setPickerOpen(true)} />
          </View>

          <View style={styles.row}>
            <Text style={styles.lbl}>Quantity</Text>
            <View style={styles.stepper}>
              <Pressable onPress={() => setQty((q) => Math.max(1, q - 1))} style={styles.stepBtn}>
                <Text style={styles.stepTxt}>−</Text>
              </Pressable>
              <Text style={styles.qty}>{qty}</Text>
              <Pressable onPress={() => setQty((q) => Math.min(50, q + 1))} style={styles.stepBtn}>
                <Text style={styles.stepTxt}>+</Text>
              </Pressable>
            </View>
          </View>

          <Pressable onPress={() => setRedeemOpen(!redeemOpen)}>
            <Text style={styles.acc}>How to redeem {redeemOpen ? '▼' : '▶'}</Text>
          </Pressable>
          {redeemOpen ? (
            <Text style={styles.body}>
              {product.resolved?.how_to_redeem ?? product.how_to_redeem ?? '—'}
            </Text>
          ) : null}

          <Pressable onPress={() => setTermsOpen(!termsOpen)}>
            <Text style={styles.acc}>Terms & conditions {termsOpen ? '▼' : '▶'}</Text>
          </Pressable>
          {termsOpen ? (
            <Text style={styles.body}>
              {product.resolved?.terms ?? product.terms_and_conditions ?? '—'}
            </Text>
          ) : null}

          <Button
            title="Add to cart"
            fullWidth
            disabled={oos}
            onPress={addToCart}
            style={{ marginTop: spacing(2) }}
          />
          <Button
            title="Buy now"
            variant="secondary"
            fullWidth
            disabled={oos}
            onPress={buyNow}
            style={{ marginTop: spacing(1) }}
          />

          {!authenticated ? (
            <Text style={styles.hint}>Sign in at checkout for wallet / saved profile.</Text>
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  err: { color: colors.danger, marginTop: spacing(1) },
  hero: { width: '100%', aspectRatio: 1.2 },
  ph: { backgroundColor: colors.surface },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: spacing(1) },
  price: { color: colors.primary, fontSize: 20, fontWeight: '700', marginTop: spacing(0.5) },
  disc: { color: colors.success, marginTop: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing(1.5),
  },
  lbl: { color: colors.textMuted },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: {
    backgroundColor: colors.surface,
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepTxt: { color: colors.text, fontSize: 20 },
  qty: { color: colors.text, marginHorizontal: spacing(1.5), fontSize: 18, fontWeight: '700' },
  acc: { color: colors.primary, marginTop: spacing(1.5), fontWeight: '600' },
  body: { color: colors.textMuted, marginTop: spacing(0.75), lineHeight: 22 },
  hint: { color: colors.textMuted, marginTop: spacing(2), textAlign: 'center' },
});
