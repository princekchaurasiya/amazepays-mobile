import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export function Header({ title, onBack, right }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.backPh} />
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(1),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  left: { width: 40, alignItems: 'flex-start' },
  back: { padding: spacing(0.5) },
  backPh: { width: 28 },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  right: { width: 40, alignItems: 'flex-end' },
});
