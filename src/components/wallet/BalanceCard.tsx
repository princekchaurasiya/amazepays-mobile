import { Card } from '@/components/ui/Card';
import { colors, spacing } from '@/theme';
import type { WalletBalance } from '@/types/models';
import { formatInr } from '@/utils/format';
import { StyleSheet, Text, View } from 'react-native';

export function BalanceCard({ data }: { data: WalletBalance }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Wallet balance</Text>
      <Text style={styles.amount}>{formatInr(data.balance)}</Text>
      {data.is_frozen ? (
        <View style={styles.freeze}>
          <Text style={styles.freezeText}>Account frozen — contact support</Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing(2) },
  label: { color: colors.textMuted, fontSize: 14 },
  amount: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    marginTop: spacing(0.5),
  },
  freeze: {
    marginTop: spacing(1),
    backgroundColor: colors.warningMutedBg,
    padding: spacing(1),
    borderRadius: 8,
  },
  freezeText: { color: colors.warning, fontSize: 13 },
});
