import { colors, spacing } from '@/theme';
import { StyleSheet, View, type ViewProps } from 'react-native';

export function Skeleton({ style, ...rest }: ViewProps) {
  return <View style={[styles.box, style]} {...rest} />;
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surface2,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
