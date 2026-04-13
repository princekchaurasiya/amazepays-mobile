import { colors, spacing } from '@/theme';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} style={{ marginTop: spacing(2) }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  desc: {
    color: colors.textMuted,
    marginTop: spacing(1),
    textAlign: 'center',
  },
});
