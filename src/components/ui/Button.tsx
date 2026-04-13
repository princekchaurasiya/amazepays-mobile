import { colors, spacing } from '@/theme';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'outline' | 'destructive';

type Props = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

const variantStyles: Record<Variant, { container: ViewStyle; label: TextStyle }> = {
  primary: {
    container: { backgroundColor: colors.primary },
    label: { color: colors.background },
  },
  secondary: {
    container: { backgroundColor: colors.surface2 },
    label: { color: colors.text },
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    label: { color: colors.primary },
  },
  destructive: {
    container: { backgroundColor: colors.danger },
    label: { color: colors.text },
  },
};

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  fullWidth,
  style,
  ...rest
}: Props) {
  const vs = variantStyles[variant];
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        vs.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.background : colors.text} />
      ) : (
        <Text style={[styles.label, vs.label]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(2),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  fullWidth: { alignSelf: 'stretch' },
  label: { fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});
