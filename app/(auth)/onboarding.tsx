import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/stores/appStore';
import { colors, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import { Platform, Text, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { ms } from '@/utils/scaling';

export default function OnboardingScreen() {
  const router = useRouter();
  const complete = useAppStore((s) => s.setOnboardingComplete);
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1"
      style={{
        paddingTop: insets.top + spacing(1), // ✅ improved
        paddingBottom: insets.bottom + spacing(2),
        backgroundColor: Colors.neutral[50],
      }}
    >
      {/* Decorative background */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -ms(120),
          right: -ms(100),
          width: ms(240),
          height: ms(240),
          borderRadius: ms(120),
          backgroundColor: colors.accent,
          opacity: 0.1,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -ms(140),
          left: -ms(120),
          width: ms(280),
          height: ms(280),
          borderRadius: ms(140),
          backgroundColor: Colors.brand[500],
          opacity: 0.08,
        }}
      />

      {/* Main Content */}
      <View
        className="flex-1 justify-center"
        style={{ paddingHorizontal: spacing(3), paddingTop: spacing(3) }}
      >
        <Animated.View
          entering={FadeInUp.duration(800).delay(200)}
          className="items-center"
        >
          {/* Logo */}
          <View
            style={[
              {
                marginBottom: spacing(3),
                width: ms(140),
                height: ms(140),
                borderRadius: ms(20),
                backgroundColor: colors.neutral[0],
                borderWidth: 1,
                borderColor: colors.neutral[200],
                alignItems: 'center',
                justifyContent: 'center',
              },
              Platform.select({
                ios: {
                  shadowColor: '#000', // ✅ fixed
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                },
                android: {
                  elevation: 6,
                },
              }),
            ]}
          >
            <Image
              source={require('../../assets/logo.png')}
              style={{
                width: ms(90),
                height: ms(80),
              }}
              resizeMode="contain"
            />
          </View>

          {/* Heading */}
          <Animated.Text
            entering={FadeIn.delay(320).duration(500)}
            className="font-semibold text-center"
            style={{
              fontSize: ms(24),
              color: Colors.brand[600],
              marginBottom: spacing(1),
            }}
          >
            Welcome to
          </Animated.Text>

          <Animated.Text
            entering={FadeIn.delay(520).duration(500)}
            className="text-base font-medium text-center"
            style={{ marginBottom: spacing(1.75) }}
          >
            <Text style={{ color: Colors.brand[500] }}>Fast. </Text>
            <Text style={{ color: colors.accent }}>Trusted. </Text>
            <Text style={{ color: Colors.brand[700] }}>Simple.</Text>
          </Animated.Text>

          {/* Tagline */}
          <Animated.Text
            entering={FadeIn.delay(600).duration(600)}
            className="text-lg text-center leading-7"
            style={{
              color: Colors.brand[700],
              marginBottom: spacing(1.75),
            }}
          >
            Buy digital gift cards{' '}
            <Text style={{ color: colors.accent, fontWeight: '700' }}>
              instantly
            </Text>
          </Animated.Text>
        </Animated.View>

        {/* Features */}
        <Animated.View
          entering={FadeInUp.delay(1000).duration(600)}
          className="w-full"
          style={{ marginTop: spacing(4) }}
        >
          <View className="flex-row items-center justify-center">
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: colors.accent }}
            />
            <Text
              className="text-sm font-medium"
              style={{
                color: Colors.brand[700],
                marginLeft: spacing(1),
              }}
            >
              Fast & Secure
            </Text>

            <View
              className="w-1 h-1 rounded-full"
              style={{
                backgroundColor: colors.neutral[400],
                marginHorizontal: spacing(2),
              }}
            />

            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: colors.brand[200] }}
            />
            <Text
              className="text-sm font-medium"
              style={{
                color: Colors.brand[700],
                marginLeft: spacing(1),
              }}
            >
              B2C
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Buttons */}
      <Animated.View
        entering={FadeInUp.delay(1200).duration(600)}
        style={{
          paddingHorizontal: spacing(3),
          paddingTop: spacing(2.5),
        }}
      >
      <View style={{ marginBottom: spacing(2) }}>
    <Button
      title="Get Started"
      fullWidth
      style={{
        minHeight: ms(52),
        paddingVertical: spacing(1.5),
        backgroundColor: colors.brand[600],
        borderRadius: spacing(1.75),
      }}
      onPress={() => {
        complete(true);
        router.replace('/(auth)/welcome');
      }}
    />
  </View>
        <Button
          title="I already have an account"
          variant="outline"
          fullWidth
          style={{
            minHeight: ms(52),
            paddingVertical: spacing(1.5),
            borderColor: Colors.brand[500],
            borderRadius: spacing(1.75),
          }}
          className="bg-transparent"
          onPress={() => {
            complete(true);
            router.replace('/(auth)/welcome');
          }}
        />
      </Animated.View>
    </View>
  );
}
