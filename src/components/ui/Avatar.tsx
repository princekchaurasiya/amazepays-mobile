import { colors, spacing } from '@/theme';
import { StyleSheet, Text, View } from 'react-native';

export function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <View style={styles.circle}>
      <Text style={styles.initial}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: colors.background,
    fontSize: 20,
    fontWeight: '700',
  },
});
