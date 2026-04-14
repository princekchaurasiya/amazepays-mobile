import { Text, View } from 'react-native';

type Tone = 'default' | 'success' | 'warning' | 'danger';

const tones: Record<Tone, { bg: string; fg: string }> = {
  default: { bg: 'bg-surface2', fg: 'text-text' },
  success: { bg: 'bg-success-muted-bg', fg: 'text-success' },
  warning: { bg: 'bg-warning-muted-bg', fg: 'text-warning' },
  danger: { bg: 'bg-danger-muted-bg', fg: 'text-danger' },
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
    <View className={`self-start rounded-lg px-2 py-1 ${t.bg}`}>
      <Text className={`text-xs font-semibold capitalize ${t.fg}`}>{label}</Text>
    </View>
  );
}
