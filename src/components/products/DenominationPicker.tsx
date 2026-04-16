import { colors, spacing } from '@/theme';
import { formatInr } from '@/utils/format';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';

type Props = {
  visible: boolean;
  onClose: () => void;
  min: number;
  max: number;
  value: number;
  onConfirm: (amount: number) => void;
  denominations?: number[];
};

export function DenominationPicker({
  visible,
  onClose,
  min,
  max,
  value,
  onConfirm,
  denominations,
}: Props) {
  const hasPresets = (denominations?.length ?? 0) > 0;
  const presets = useMemo(() => (denominations ?? []).filter((n) => n > 0), [denominations]);

  const [selected, setSelected] = useState<number>(value || min);
  const [custom, setCustom] = useState(String(value || min));

  useEffect(() => {
    setSelected(value || min);
    setCustom(String(value || min));
  }, [value, min, visible]);

  const parseCustom = () => {
    const n = parseFloat(String(custom).replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? n : NaN;
  };

  const canApply = () => {
    const amount = hasPresets ? selected : parseCustom();
    return Number.isFinite(amount) && amount >= min && amount <= max;
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Choose amount" >
      <View style={styles.summaryRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryLabel}>Selected</Text>
          <Text style={styles.summaryValue}>{formatInr(hasPresets ? selected : (Number.isFinite(parseCustom()) ? parseCustom() : value || min))}</Text>
        </View>
        <View style={styles.rangePill}>
          <Text style={styles.rangeText}>
            {formatInr(min)} – {formatInr(max)}
          </Text>
        </View>
      </View>

      {hasPresets ? (
        <View style={styles.pills}>
          {presets.map((d) => {
            const active = selected === d;
            return (
              <Pressable
                key={d}
                onPress={() => setSelected(d)}
                style={({ pressed }) => [
                  styles.pill,
                  active && styles.pillActive,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{formatInr(d)}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <>
          <Text style={styles.hint}>Enter an amount between {formatInr(min)} and {formatInr(max)}</Text>
          <TextInput
            keyboardType="decimal-pad"
            value={custom}
            onChangeText={setCustom}
            placeholder="Amount"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </>
      )}

      <View style={styles.actions}>
        <View style={{ flex: 1 }}>
          <Button title="Cancel" variant="secondary" fullWidth onPress={onClose} />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title="Apply"
            fullWidth
            disabled={!canApply()}
            onPress={() => {
              const amount = hasPresets ? selected : parseCustom();
              if (Number.isFinite(amount) && amount >= min && amount <= max) {
                onConfirm(amount);
                onClose();
              }
            }}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    marginBottom: spacing(2),
  },
  summaryLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  summaryValue: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: 2 },
  rangePill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing(1.25),
    paddingVertical: spacing(0.75),
  },
  rangeText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },

  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing(1) },
  pill: {
    paddingHorizontal: spacing(1.75),
    paddingVertical: spacing(1.25),
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 112,
    alignItems: 'center',
  },
  pillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.chipActiveBg,
  },
  pillText: { color: colors.text, fontWeight: '800' },
  pillTextActive: { color: colors.primary },
  hint: { color: colors.textMuted, marginBottom: spacing(1.25), fontWeight: '600' },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing(1.5),
    color: colors.text,
    fontSize: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: { flexDirection: 'row', gap: spacing(1), marginTop: spacing(2) },
});
