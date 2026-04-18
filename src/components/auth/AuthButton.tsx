import { authColors, authFonts, authRadii, grid } from '@/auth/authTheme';
import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  title: string;
  loading?: boolean;
  fullWidth?: boolean;
};

export function AuthButton({ title, loading, disabled, fullWidth, ...rest }: Props) {
  const scale = useSharedValue(1);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled || loading ? 0.45 : 1,
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 320 });
      }}
      style={[
        {
          minHeight: 56,
          borderRadius: authRadii.button,
          backgroundColor: authColors.primary,
          paddingHorizontal: grid(4),
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        anim,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={authColors.onPrimary} />
      ) : (
        <Text
          style={{
            fontFamily: authFonts.label,
            fontSize: 17,
            color: authColors.onPrimary,
          }}
        >
          {title}
        </Text>
      )}
    </AnimatedPressable>
  );
}
