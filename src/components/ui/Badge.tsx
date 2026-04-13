import { colors, spacing } from '@/theme';
import { StyleSheet, Text, View } from 'react-native';

type Tone = 'default' | 'success' | 'warning' | 'danger';

const tones: Record<Tone, { bg: string; fg: string }> = {
  default: { bg: colors.surface2, fg: colors.text },
  success: { bg: '#14532d', fg: colors.success },
  warning: { bg: '#422006', fg: colors.warning },
  danger: { bg: '#450a0a', fg: colors.danger },
};

export function Badge({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: Tone;
}) {
  const t = tones[tone];
  return (
    <View style={[styles.wrap, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.5),
    borderRadius: 8,
  },
  text: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
});
