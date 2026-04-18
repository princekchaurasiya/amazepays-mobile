import { authColors, authFonts, authRadii, grid } from '@/auth/authTheme';
import { forwardRef, useEffect } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Props = Omit<TextInputProps, 'style'> & {
  label?: string;
  error?: string;
  prefix?: string;
};

const AnimatedView = Animated.createAnimatedComponent(View);

export const AuthInput = forwardRef<TextInput, Props>(function AuthInput(
  { label, error, prefix, onFocus, onBlur, ...rest },
  ref
) {
  const focus = useSharedValue(0);
  const err = useSharedValue(0);

  useEffect(() => {
    err.value = error ? 1 : 0;
  }, [error, err]);

  const rim = useAnimatedStyle(() => {
    if (err.value === 1) {
      return {
        borderColor: authColors.error,
        borderWidth: 2,
      };
    }
    if (focus.value === 1) {
      return {
        borderColor: authColors.primary,
        borderWidth: 2,
      };
    }
    return {
      borderColor: authColors.outlineGhost,
      borderWidth: 1,
    };
  });

  return (
    <View style={{ marginBottom: grid(3) }}>
      {label ? (
        <Text
          style={{
            marginBottom: grid(1),
            fontFamily: authFonts.label,
            fontSize: 14,
            color: authColors.textMuted,
          }}
        >
          {label}
        </Text>
      ) : null}
      <AnimatedView
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: authRadii.input,
            backgroundColor: authColors.background,
            paddingHorizontal: grid(3),
            minHeight: grid(14),
          },
          rim,
        ]}
      >
        {prefix ? (
          <Text
            style={{
              fontFamily: authFonts.bodyMedium,
              fontSize: 17,
              color: authColors.primary,
              marginRight: grid(2),
            }}
          >
            {prefix}
          </Text>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={authColors.textMuted}
          style={{
            flex: 1,
            paddingVertical: grid(2),
            fontFamily: authFonts.body,
            fontSize: 17,
            color: authColors.text,
          }}
          onFocus={(e) => {
            focus.value = withTiming(1, { duration: 160 });
            onFocus?.(e);
          }}
          onBlur={(e) => {
            focus.value = withTiming(0, { duration: 160 });
            onBlur?.(e);
          }}
          {...rest}
        />
      </AnimatedView>
      {error ? (
        <Text style={{ marginTop: grid(1), fontSize: 12, color: authColors.error }}>{error}</Text>
      ) : null}
    </View>
  );
});
