import { colors, spacing } from '@/theme';
import { StyleSheet, View, type ViewProps } from 'react-native';

export function Card({ style, ...rest }: ViewProps) {
  return <View style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing(2),
    borderWidth: 1,
    borderColor: colors.border,
  },
});
