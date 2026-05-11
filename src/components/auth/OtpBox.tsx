import { authColors, authFonts, grid } from '@/auth/authTheme';
import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useEffect } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const BOX_W = 48;
const BOX_H = 56;

type Props = {
  index: number;
  value: string;
  onChangeText: (t: string) => void;
  onKeyPress: (key: string) => void;
  shakeToken: number;
  success: boolean;
  editable: boolean;
};

export const OtpBox = forwardRef<TextInput, Props>(function OtpBox(
  { index, value, onChangeText, onKeyPress, shakeToken, success, editable },
  ref
) {
  const offset = useSharedValue(0);

  useEffect(() => {
    if (shakeToken <= 0) return;
    offset.value = withSequence(
      withTiming(-6, { duration: 40 }),
      withTiming(6, { duration: 40 }),
      withTiming(-4, { duration: 40 }),
      withTiming(4, { duration: 40 }),
      withTiming(0, { duration: 40 })
    );
  }, [shakeToken, offset]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(70 * index + 40)
        .springify()
        .damping(14)
        .stiffness(220)}
      style={{ width: BOX_W, height: BOX_H }}
    >
      <Animated.View style={[{ flex: 1 }, shakeStyle]}>
        <View
          style={{
            flex: 1,
            borderRadius: grid(3),
            borderWidth: success ? 2 : value ? 2 : 1,
            borderColor: success ? authColors.success : value ? authColors.primary : authColors.outlineGhost,
            backgroundColor: authColors.background,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          onKeyPress={({ nativeEvent }) => onKeyPress(nativeEvent.key)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          editable={editable && !success}
          textAlign="center"
          importantForAutofill="no"
          style={{
            width: '100%',
            height: '100%',
            fontFamily: authFonts.label,
            fontSize: 22,
            color: authColors.text,
            padding: 0,
            opacity: success ? 0 : 1,
          }}
        />
        {success ? (
          <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
            <Animated.View entering={FadeInDown.springify()}>
              <Ionicons name="checkmark-circle" size={28} color={authColors.success} />
            </Animated.View>
          </View>
        ) : null}
        </View>
      </Animated.View>
    </Animated.View>
  );
});

