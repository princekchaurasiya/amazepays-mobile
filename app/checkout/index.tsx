import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useApplyOffer } from '@/hooks/useOffers';
import { usePlaceOrder } from '@/hooks/useOrders';
import { colors, spacing } from '@/theme';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { formatInr } from '@/utils/format';
import { checkoutSchema } from '@/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

type Form = z.infer<typeof checkoutSchema>;

const paymentOptions = [
  { label: 'Wallet', value: 'wallet' as const },
  { label: 'CCAvenue', value: 'ccavenue' as const },
  { label: 'Razorpay', value: 'razorpay' as const },
  { label: 'Unlimit', value: 'unlimit' as const },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items = useCartStore((s) => s.items);
  const promo = useCartStore((s) => s.promoCode);
  const setPromo = useCartStore((s) => s.setPromo);
  const discount = useCartStore((s) => s.discountAmount);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const authenticated = useAuthStore((s) => s.isAuthenticated);
  const placeOrder = usePlaceOrder();
  const applyOffer = useApplyOffer();
  const [promoInput, setPromoInput] = useState('');
  const [offerErr, setOfferErr] = useState<string | null>(null);

  const first = items[0];
  const subtotal = getSubtotal();
  const total = Math.max(0, subtotal - discount);

  const { control, handleSubmit } = useForm<Form>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      gift_send_option: 'buy_for_self',
      receiver_name: '',
      receiver_email: '',
      receiver_mobile: '',
      receiver_msg: '',
      payment_method: 'wallet',
    },
  });

  if (!authenticated) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Header title="Checkout" onBack={() => router.back()} />
        <View style={{ padding: spacing(2) }}>
          <Text style={styles.text}>Sign in to place an order.</Text>
          <Button title="Sign in" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: spacing(2) }} />
        </View>
      </View>
    );
  }

  if (!first) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Header title="Checkout" onBack={() => router.back()} />
        <View style={{ padding: spacing(2) }}>
          <Text style={styles.text}>Your cart is empty.</Text>
          <Button title="Browse" onPress={() => router.replace('/(tabs)/browse')} style={{ marginTop: spacing(2) }} />
        </View>
      </View>
    );
  }

  const applyPromo = async () => {
    setOfferErr(null);
    try {
      const r = await applyOffer.mutateAsync({
        promo_code: promoInput.trim(),
        order_amount: subtotal,
        product_id: first.productId,
      });
      setPromo(promoInput.trim(), subtotal - r.final_amount);
    } catch {
      setOfferErr('Invalid or expired promo');
      setPromo(null, 0);
    }
  };

  const submit = handleSubmit(async (values) => {
    const body = {
      product_id: first.productId,
      quantity: first.quantity,
      denomination: first.denomination,
      payment_method: values.payment_method,
      offer_code: promo ?? undefined,
      gift_send_option: values.gift_send_option,
      receiver_name: values.receiver_name || undefined,
      receiver_email: values.receiver_email || undefined,
      receiver_mobile: values.receiver_mobile?.replace(/\D/g, '') || undefined,
      receiver_msg: values.receiver_msg || undefined,
    };

    const res = await placeOrder.mutateAsync(body);

    if (values.payment_method !== 'wallet' && res.payment?.redirect_url) {
      clearCart();
      router.replace({
        pathname: '/payment',
        params: {
          url: res.payment.redirect_url,
          orderId: String(res.order_id),
        },
      });
      return;
    }

    clearCart();
    router.replace(`/order/${res.order_id}`);
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Header title="Checkout" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(4) }}>
        <Card>
          <Text style={styles.cardTitle}>Summary</Text>
          <Text style={styles.line}>{first.name}</Text>
          <Text style={styles.muted}>
            Qty {first.quantity} × {formatInr(first.denomination)}
          </Text>
          <Text style={styles.total}>Subtotal {formatInr(subtotal)}</Text>
          {discount > 0 ? (
            <Text style={styles.disc}>Discount −{formatInr(discount)}</Text>
          ) : null}
          <Text style={styles.grand}>Pay {formatInr(total)}</Text>
        </Card>

        <Text style={styles.section}>Promo</Text>
        <View style={styles.promoRow}>
          <Input
            placeholder="Code"
            value={promoInput}
            onChangeText={setPromoInput}
            style={{ flex: 1 }}
          />
          <Button title="Apply" variant="secondary" onPress={applyPromo} />
        </View>
        {promo ? <Text style={styles.ok}>Applied: {promo}</Text> : null}
        {offerErr ? <Text style={styles.err}>{offerErr}</Text> : null}

        <Text style={styles.section}>Gift options</Text>
        <Controller
          control={control}
          name="gift_send_option"
          render={({ field: { onChange, value } }) => (
            <View style={styles.giftRow}>
              {(['buy_for_self', 'send_as_gift'] as const).map((opt) => (
                <Button
                  key={opt}
                  title={opt === 'buy_for_self' ? 'For myself' : 'Send as gift'}
                  variant={value === opt ? 'primary' : 'outline'}
                  onPress={() => onChange(opt)}
                />
              ))}
            </View>
          )}
        />

        <Controller
          control={control}
          name="receiver_name"
          render={({ field: { onChange, value }, fieldState }) => (
            <Input label="Recipient name" value={value ?? ''} onChangeText={onChange} error={fieldState.error?.message} />
          )}
        />
        <Controller
          control={control}
          name="receiver_email"
          render={({ field: { onChange, value }, fieldState }) => (
            <Input
              label="Recipient email"
              value={value ?? ''}
              onChangeText={onChange}
              keyboardType="email-address"
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="receiver_mobile"
          render={({ field: { onChange, value }, fieldState }) => (
            <Input
              label="Recipient mobile (10 digits)"
              value={value ?? ''}
              onChangeText={onChange}
              keyboardType="phone-pad"
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="receiver_msg"
          render={({ field: { onChange, value } }) => (
            <Input label="Message" value={value ?? ''} onChangeText={onChange} multiline />
          )}
        />

        <Text style={styles.section}>Payment</Text>
        <Controller
          control={control}
          name="payment_method"
          render={({ field: { onChange, value } }) => (
            <View style={styles.payGrid}>
              {paymentOptions.map((p) => (
                <Button
                  key={p.value}
                  title={p.label}
                  variant={value === p.value ? 'primary' : 'outline'}
                  onPress={() => onChange(p.value)}
                />
              ))}
            </View>
          )}
        />

        <Button
          title={placeOrder.isPending ? 'Placing order…' : 'Place order'}
          fullWidth
          loading={placeOrder.isPending}
          onPress={submit}
          style={{ marginTop: spacing(2) }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  text: { color: colors.text },
  cardTitle: { color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: spacing(0.75) },
  line: { color: colors.text, fontWeight: '600' },
  muted: { color: colors.textMuted, marginTop: 4 },
  total: { color: colors.text, marginTop: spacing(1) },
  disc: { color: colors.success, marginTop: 4 },
  grand: { color: colors.primary, fontWeight: '800', fontSize: 18, marginTop: spacing(0.75) },
  section: { color: colors.textMuted, fontWeight: '600', marginTop: spacing(2), marginBottom: spacing(0.75) },
  promoRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  err: { color: colors.danger, marginTop: 8 },
  ok: { color: colors.success, marginTop: 8 },
  giftRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  payGrid: { gap: 8 },
});
