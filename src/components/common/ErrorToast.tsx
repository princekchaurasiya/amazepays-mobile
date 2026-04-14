import { colors, spacing } from '@/theme';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

export function ErrorToast({
  message,
  onHide,
}: {
  message: string | null;
  onHide: () => void;
}) {
  const op = useRef(new Animated.Value(0)).current;
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;

  useEffect(() => {
    if (!message) return;
    op.setValue(0);
    Animated.sequence([
      Animated.timing(op, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2800),
      Animated.timing(op, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onHideRef.current());
  }, [message, op]);

  if (!message) return null;

  return (
    <Animated.View style={[styles.toast, { opacity: op }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: spacing(3),
    left: spacing(2),
    right: spacing(2),
    backgroundColor: colors.dangerMutedBg,
    padding: spacing(1.5),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  text: { color: colors.text, textAlign: 'center' },
});
