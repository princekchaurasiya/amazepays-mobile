import { colors, spacing } from '@/theme';
import { useState } from 'react';
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
  const [custom, setCustom] = useState(String(value || min));
  const hasPresets = denominations && denominations.length > 0;

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Choose amount">
      {hasPresets ? (
        <View style={styles.pills}>
          {denominations!.map((d) => (
            <Pressable
              key={d}
              onPress={() => {
                onConfirm(d);
                onClose();
              }}
              style={[styles.pill, value === d && styles.pillActive]}
            >
              <Text style={[styles.pillText, value === d && styles.pillTextActive]}>
                ₹{d}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <>
          <Text style={styles.hint}>
            Enter between ₹{min} and ₹{max}
          </Text>
          <TextInput
            keyboardType="decimal-pad"
            value={custom}
            onChangeText={setCustom}
            placeholder="Amount"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
          <Button
            title="Apply"
            fullWidth
            onPress={() => {
              const n = parseFloat(custom);
              if (Number.isFinite(n) && n >= min && n <= max) {
                onConfirm(n);
                onClose();
              }
            }}
            style={{ marginTop: spacing(1) }}
          />
        </>
      )}
      <Button title="Done" variant="secondary" fullWidth onPress={onClose} style={{ marginTop: spacing(2) }} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1),
    borderRadius: 20,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: { borderColor: colors.primary, backgroundColor: '#0c4a6e' },
  pillText: { color: colors.text },
  pillTextActive: { color: colors.primary },
  hint: { color: colors.textMuted, marginBottom: spacing(1) },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing(1.5),
    color: colors.text,
    fontSize: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
