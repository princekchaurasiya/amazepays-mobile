import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { useAppStore } from '@/stores/appStore';
import { colors, spacing } from '@/theme';
import { ms } from '@/utils/scaling';
import { normalizeIndianMobile, phoneSchema } from '@/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useCallback, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

type PhoneForm = z.infer<typeof phoneSchema>;

const LOGO_ASPECT = 120 / 56;

function formatPhoneDisplay(digits: string) {
  const d = digits.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)} ${d.slice(5)}`;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const setGuest = useAppStore((s) => s.setAllowGuestBrowse);
  const { sendOtp, busy, error, setError } = useAuthFlow();

  // ✅ FIX: infinite smooth animation
  const logoScale = useSharedValue(1);
  useEffect(() => {
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1,
      true
    );
  }, [logoScale]);

  const logoPulse = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { mobile: '' },
  });

  const isWide = width >= 768;
  const contentWidth = Math.min(width - spacing(6), ms(560));
  const logoWidth = isWide ? ms(210) : Math.min(ms(150), width * 0.38);

  const onContinue = phoneForm.handleSubmit(async ({ mobile }) => {
    setError(null);
    const ok = await sendOtp(mobile);
    if (!ok) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/(auth)/otp', params: { phone: mobile } });
  });

  const browse = useCallback(async () => {
    await Haptics.selectionAsync();
    setGuest(true);
    router.replace('/(tabs)');
  }, [router, setGuest]);

  const logoBlock = () => (
    <Animated.View
      className="items-center justify-center"
      style={[{ marginBottom: spacing(4) }, logoPulse]}
    >
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: logoWidth, aspectRatio: LOGO_ASPECT }}
        contentFit="contain"
      />
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: Colors.neutral[50] }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        className="flex-1"
        style={{
          paddingTop: insets.top + spacing(1),
          paddingBottom: insets.bottom + spacing(2),
          paddingHorizontal: spacing(2),
        }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingTop: spacing(2), // ✅ fix
            paddingBottom: spacing(2),
          }}
        >
          <View
            className="self-center w-full rounded-2xl border border-border bg-surface"
            style={{
              maxWidth: contentWidth,
              paddingHorizontal: spacing(2.5),
              paddingVertical: isWide ? spacing(3) : spacing(2.5), // ✅ adaptive
            }}
          >
            {logoBlock()}

            <Text
              className="text-center font-semibold"
              style={{
                fontSize: isWide ? ms(30) : ms(26),
                color: colors.primary,
                marginBottom: spacing(1),
              }}
            >
              Welcome
            </Text>

            <Text
              className="text-center"
              style={{
                fontSize: ms(15),
                color: colors.textMuted,
                marginBottom: spacing(3),
              }}
            >
              Sign in with mobile — no password
            </Text>

            {/* Input */}
            <Controller
              control={phoneForm.control}
              name="mobile"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <View style={{ marginBottom: spacing(2) }}>
                  <Text
                    style={{
                      color: colors.text,
                      marginBottom: spacing(1),
                      fontSize: ms(14),
                      fontWeight: '500',
                    }}
                  >
                    Mobile number
                  </Text>

                  <View
                    className="flex-row items-center rounded-xl border border-border bg-surface2"
                    style={{ minHeight: ms(52), paddingHorizontal: spacing(1.5) }}
                  >
                    <Text style={{ color: colors.textMuted, marginRight: spacing(1) }}>
                      +91
                    </Text>

                    <TextInput
                      className="flex-1 text-text"
                      value={formatPhoneDisplay(value)}
                      onChangeText={(t) => onChange(normalizeIndianMobile(t))}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                      placeholder="98765 43210"
                      placeholderTextColor={colors.textMuted}
                      maxLength={12}
                      style={{ fontSize: ms(15), paddingVertical: spacing(1.25) }}
                    />
                  </View>

                  {fieldState.error?.message && (
                    <Text
                      style={{
                        color: colors.danger,
                        marginTop: spacing(0.75),
                        fontSize: ms(13),
                      }}
                    >
                      {fieldState.error.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {error && (
              <Text
                style={{
                  marginBottom: spacing(1.5),
                  color: colors.danger,
                  fontSize: ms(13),
                }}
              >
                {error}
              </Text>
            )}

            {/* ✅ FIX: wrap button */}
            <View style={{ marginBottom: spacing(2) }}>
              <Button
                title="Continue"
                fullWidth
                onPress={onContinue}
                loading={busy}
                disabled={busy}
              />
            </View>

            {/* ✅ FIX: wrap pressable */}
            <View className="items-center">
              <Pressable
                onPress={browse}
                style={({ pressed }) => ({
                  paddingVertical: spacing(1),
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontSize: ms(15), color: colors.textMuted }}>
                  Browse without account
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
