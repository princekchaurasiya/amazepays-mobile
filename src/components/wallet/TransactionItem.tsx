import { colors, spacing } from '@/theme';
import type { WalletTransaction } from '@/types/models';
import { formatDateTime, formatInr } from '@/utils/format';
import { StyleSheet, Text, View } from 'react-native';

export function TransactionItem({ tx }: { tx: WalletTransaction }) {
  const amt = parseFloat(String(tx.amount ?? 0));
  const isCredit = (tx.type ?? '').toLowerCase().includes('credit') || amt >= 0;
  return (
    <View style={styles.row}>
      <View style={styles.dot} />
      <View style={styles.body}>
        <Text style={styles.desc}>{tx.description || tx.type || 'Transaction'}</Text>
        <Text style={styles.date}>{formatDateTime(tx.created_at)}</Text>
        {tx.reference ? (
          <Text style={styles.ref}>Ref: {tx.reference}</Text>
        ) : null}
      </View>
      <Text style={[styles.amount, isCredit ? styles.credit : styles.debit]}>
        {isCredit ? '+' : ''}
        {formatInr(Math.abs(amt))}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing(1.5),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: spacing(1),
  },
  body: { flex: 1 },
  desc: { color: colors.text, fontWeight: '600' },
  date: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  ref: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  amount: { fontWeight: '700', fontSize: 15 },
  credit: { color: colors.success },
  debit: { color: colors.danger },
});
