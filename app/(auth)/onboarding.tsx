import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/stores/appStore';
import { colors, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import { Platform, Text, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';

export default function OnboardingScreen() {
  const router = useRouter();
  const complete = useAppStore((s) => s.setOnboardingComplete);
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1"
      style={{
        paddingTop: Platform.OS === 'ios' ? insets.top : spacing(2),
        paddingBottom: insets.bottom + spacing(2),
        backgroundColor: Colors.neutral[50],
      }}
    >
      {/* Full-screen decorative background (keeps onboarding away from card feel) */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -spacing(10),
          right: -spacing(8),
          width: spacing(30),
          height: spacing(30),
          borderRadius: spacing(15),
          backgroundColor: colors.accent,
          opacity: 0.1,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -spacing(12),
          left: -spacing(10),
          width: spacing(34),
          height: spacing(34),
          borderRadius: spacing(17),
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
          {/* Brand logo above welcome text */}
          <View
            style={[
              {
                marginBottom: spacing(3),
                width: spacing(14),
                height: spacing(14),
                borderRadius: spacing(7),
                backgroundColor: Colors.neutral[0],
                borderWidth: 1,
                borderColor: Colors.neutral[200],
                alignItems: 'center',
                justifyContent: 'center',
              },
              Platform.select({
                ios: {
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.22,
                  shadowRadius: 14,
                },
                android: { elevation: 6 },
              }),
            ]}
          >
            <Image
              source={require('../../assets/logo.png')}
              className="h-14 w-32"
              resizeMode="contain"
              
            />
          </View>

          {/* Welcome heading with brand palette */}
          <Animated.Text
            entering={FadeIn.delay(320).duration(500)}
            className="text-xl font-semibold text-center"
            style={{
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

          {/* Tagline with brand colors */}
          <Animated.Text 
            entering={FadeIn.delay(600).duration(600)}
            className="text-lg text-center leading-7"
            style={{ color: Colors.brand[700], marginBottom: spacing(1.75) }}
          >
            Buy digital gift cards{' '}
            <Text style={{ color: colors.accent, fontWeight: '700' }}>instantly</Text>
          </Animated.Text>

          <Animated.Text 
            entering={FadeIn.delay(800).duration(600)}
            className="text-base text-center leading-6"
            style={{ paddingHorizontal: spacing(2) }}
          >
            <Text style={{ color: Colors.neutral[600] }}>
              Manage your wallet, track orders, and send gifts - all in one place.
            </Text>
          </Animated.Text>
        </Animated.View>

        {/* Feature highlights */}
        <Animated.View 
          entering={FadeInUp.delay(1000).duration(600)}
          className="w-full"
          style={{ marginTop: spacing(4), rowGap: spacing(1) }}
        >
          <View className="flex-row items-center justify-center">
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: colors.accent }}
            />
            <Text
              className="text-sm font-medium"
              style={{ color: Colors.brand[700], marginLeft: spacing(1) }}
            >
              Fast & Secure
            </Text>
            <View
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: Colors.neutral[400], marginHorizontal: spacing(2) }}
            />
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: Colors.brand[200] }}
            />
            <Text
              className="text-sm font-medium"
              style={{ color: Colors.brand[700], marginLeft: spacing(1) }}
            >
              B2C & B2B
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
          rowGap: spacing(2.25),
        }}
      >
        <Button
          title="Get Started"
          fullWidth
          style={{
            minHeight: spacing(7.5),
            backgroundColor: Colors.brand[600],
            borderRadius: spacing(1.75),
          }}
          onPress={() => {
            complete(true);
            router.replace('/(auth)/welcome');
          }}
        />
        
        <Button
          title="I already have an account"
          variant="outline"
          fullWidth
          style={{
            minHeight: spacing(7.5),
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