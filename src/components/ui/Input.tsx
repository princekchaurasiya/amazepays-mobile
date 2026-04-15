import { colors, spacing } from '@/theme';
import { forwardRef } from 'react';
import {
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  className?: string;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, style, className, ...rest },
  ref
) {
  const safeClassName = typeof className === 'string' ? className : '';

  return (
    <View className="mb-3">
      {label ? <Text className="mb-1 text-sm text-text-muted">{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textMuted}
        className={`rounded-xl border bg-surface px-3 py-2.5 text-base text-text ${
          error ? 'border-danger' : 'border-border'
        } ${safeClassName}`}
        style={style}
        {...rest}
      />
      {error ? <Text className="mt-1 text-xs text-danger">{error}</Text> : null}
    </View>
  );
});
