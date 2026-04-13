import { EmptyState } from '@/components/common/EmptyState';
import { BalanceCard } from '@/components/wallet/BalanceCard';
import { TransactionItem } from '@/components/wallet/TransactionItem';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, spacing } from '@/theme';
import { useWalletBalance, useWalletTransactions, useRequestWalletLoad } from '@/hooks/useWallet';
import { useAuthStore } from '@/stores/authStore';
import { loadWalletSchema } from '@/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

type LoadForm = z.infer<typeof loadWalletSchema>;

export default function WalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const authenticated = useAuthStore((s) => s.isAuthenticated);
  const balanceQ = useWalletBalance();
  const txQ = useWalletTransactions();
  const loadMut = useRequestWalletLoad();
  const [loadOpen, setLoadOpen] = useState(false);

  const { control, handleSubmit, reset } = useForm<LoadForm>({
    resolver: zodResolver(loadWalletSchema),
    defaultValues: {
      amount: 100,
      payment_method: 'upi',
      utr_number: '',
      bank_reference: '',
    },
  });

  const txs = useMemo(
    () => txQ.data?.pages.flatMap((p) => p.data) ?? [],
    [txQ.data?.pages]
  );

  if (!authenticated) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing(2) }]}>
        <EmptyState
          title="Sign in for wallet"
          description="Manage balance and load requests from your account."
          actionLabel="Sign in"
          onAction={() => router.replace('/(auth)/login')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing(1) }]}>
      <Text style={styles.h1}>Wallet</Text>
      {balanceQ.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ margin: spacing(2) }} />
      ) : balanceQ.data ? (
        <View style={{ paddingHorizontal: spacing(2) }}>
          <BalanceCard data={balanceQ.data} />
          <Button title="Request load (B2B)" variant="outline" onPress={() => setLoadOpen(true)} />
        </View>
      ) : null}

      <Text style={styles.sub}>Transactions</Text>
      <FlatList
        data={txs}
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={{ paddingHorizontal: spacing(2), paddingBottom: spacing(3) }}
        onEndReached={() => {
          if (txQ.hasNextPage && !txQ.isFetchingNextPage) {
            txQ.fetchNextPage();
          }
        }}
        ListEmptyComponent={
          txQ.isLoading ? null : (
            <EmptyState title="No transactions" description="Wallet activity will show here." />
          )
        }
        renderItem={({ item }) => <TransactionItem tx={item} />}
      />

      <Modal visible={loadOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + spacing(2) }]}>
            <Text style={styles.modalTitle}>Wallet load request</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value }, fieldState }) => (
                <Input
                  label="Amount (₹)"
                  keyboardType="decimal-pad"
                  value={String(value)}
                  onChangeText={(v) => onChange(parseFloat(v) || 0)}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="payment_method"
              render={({ field: { onChange, value } }) => (
                <Input label="Method (bank_transfer, upi, neft, rtgs)" value={value} onChangeText={onChange} />
              )}
            />
            <Controller
              control={control}
              name="utr_number"
              render={({ field: { onChange, value }, fieldState }) => (
                <Input label="UTR" value={value} onChangeText={onChange} error={fieldState.error?.message} />
              )}
            />
            <Controller
              control={control}
              name="bank_reference"
              render={({ field: { onChange, value } }) => (
                <Input label="Bank reference (optional)" value={value ?? ''} onChangeText={onChange} />
              )}
            />
            <Button
              title={loadMut.isPending ? 'Submitting…' : 'Submit'}
              fullWidth
              loading={loadMut.isPending}
              onPress={handleSubmit(async (data) => {
                await loadMut.mutateAsync(data);
                setLoadOpen(false);
                reset();
              })}
            />
            <Button title="Cancel" variant="secondary" fullWidth onPress={() => setLoadOpen(false)} style={{ marginTop: spacing(1) }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  h1: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    paddingHorizontal: spacing(2),
    marginBottom: spacing(1),
  },
  sub: {
    color: colors.textMuted,
    paddingHorizontal: spacing(2),
    marginBottom: spacing(0.75),
    marginTop: spacing(1),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing(2),
  },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing(1.5) },
});
