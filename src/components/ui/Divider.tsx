import { colors } from '@/theme';
import { StyleSheet, View } from 'react-native';

export function Divider() {
  return <View style={styles.line} />;
}

const styles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
});
