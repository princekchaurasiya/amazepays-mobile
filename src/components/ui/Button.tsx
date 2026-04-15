import { colors } from '@/theme';
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'outline' | 'destructive';

type Props = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

const variantStyles: Record<Variant, { container: string; label: string }> = {
  primary: {
    container: 'bg-primary',
    label: 'text-on-primary',
  },
  secondary: {
    container: 'bg-surface2',
    label: 'text-text',
  },
  outline: {
    container: 'bg-transparent border border-primary-bright',
    label: 'text-primary-bright',
  },
  destructive: {
    container: 'bg-danger',
    label: 'text-on-primary',
  },
};

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  fullWidth,
  style,
  className,
  ...rest
}: Props) {
  const vs = variantStyles[variant];
  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-12 items-center justify-center rounded-xl px-4 py-3 ${vs.container} ${
        fullWidth ? 'self-stretch' : ''
      } ${className ?? ''}`}
      style={({ pressed }) => [
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.85 },
        style,
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'destructive' ? colors.onPrimary : colors.text}
        />
      ) : (
        <Text
          className={`text-base font-semibold ${vs.label}`}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
