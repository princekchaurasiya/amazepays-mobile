import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, spacing } from '@/theme';
import { useFetchVoucherMutation, useOrder } from '@/hooks/useOrders';
import { formatDate } from '@/utils/format';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Platform, Share, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VoucherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: order } = useOrder(id);
  const fetchVoucher = useFetchVoucherMutation();
  const [revealCard, setRevealCard] = useState(false);
  const [revealPin, setRevealPin] = useState(false);

  const voucher = fetchVoucher.data;
  const code = voucher?.voucher_code ?? order?.voucher_code;
  const pin = voucher?.pin ?? order?.voucher_pin;

  const loadSecure = async () => {
    if (!id) return;
    await fetchVoucher.mutateAsync(id);
  };

  const mask = (s: string | undefined | null, show: boolean) => {
    if (!s) return '—';
    if (show) return s;
    return '•'.repeat(Math.min(12, s.length));
  };

  const sharePayload = () => {
    const lines = [code ? `Card: ${code}` : '', pin ? `PIN: ${pin}` : ''].filter(Boolean);
    void Share.share({ message: lines.join('\n') });
  };

  return (
    <View style={[styles.root, { paddingTop: Platform.OS === 'ios' ? insets.top : 0 }]}>
      <Header title="Voucher" onBack={() => router.back()} />
      <View style={{ padding: spacing(2) }}>
        <Card>
          <Text style={styles.title}>{order?.product_name ?? 'Voucher'}</Text>
          <Text style={styles.meta}>Expires: {formatDate(voucher?.expiry_date ?? order?.expiry_date)}</Text>

          {!voucher && !code ? (
            <Button
              title={fetchVoucher.isPending ? 'Loading…' : 'Reveal voucher (PIN protected)'}
              fullWidth
              style={{ marginTop: spacing(2) }}
              onPress={loadSecure}
            />
          ) : null}

          {fetchVoucher.isPending ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing(2) }} />
          ) : null}

          {fetchVoucher.isError ? (
            <Text style={styles.err}>
              Could not load voucher. Ensure transaction PIN / step-up auth on API.
            </Text>
          ) : null}

          <Text style={styles.label}>Card number</Text>
          <VoucherRow
            value={mask(code, revealCard)}
            onReveal={() => setRevealCard((v) => !v)}
            onCopy={() => code && void Share.share({ message: code })}
          />

          <Text style={[styles.label, { marginTop: spacing(1.5) }]}>PIN</Text>
          <VoucherRow
            value={mask(pin, revealPin)}
            onReveal={() => setRevealPin((v) => !v)}
            onCopy={() => pin && void Share.share({ message: pin })}
          />

          {code ? (
            <View style={styles.qrWrap}>
              <QRCode value={code} size={160} backgroundColor={colors.surface} color={colors.text} />
            </View>
          ) : null}

          <Button title="Share" variant="secondary" fullWidth onPress={sharePayload} style={{ marginTop: spacing(2) }} />
        </Card>
      </View>
    </View>
  );
}

function VoucherRow({
  value,
  onReveal,
  onCopy,
}: {
  value: string;
  onReveal: () => void;
  onCopy: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.code}>{value}</Text>
      <View style={styles.btns}>
        <Button title="Show" variant="outline" onPress={onReveal} />
        <Button title="Copy" variant="secondary" onPress={onCopy} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  meta: { color: colors.textMuted, marginTop: spacing(0.75) },
  label: { color: colors.textMuted, marginTop: spacing(1) },
  row: { marginTop: spacing(0.5) },
  code: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing(1),
  },
  btns: { flexDirection: 'row', gap: 8 },
  qrWrap: { alignItems: 'center', marginTop: spacing(2) },
  err: { color: colors.danger, marginTop: spacing(1) },
});
