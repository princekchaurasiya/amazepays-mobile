import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { colors, layout, spacing } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ProfileRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  right: ReactNode;
  onPress?: () => void;
}) {
  const inner = (
    <View
      className="flex-row items-center justify-between"
      style={{ paddingHorizontal: spacing(2.5), paddingVertical: spacing(2.5) }}
    >
      <View className="min-w-0 flex-1 flex-row items-center" style={{ gap: spacing(1.5) }}>
        <View
          className="h-11 w-11 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: colors.surface2 }}
        >
          <MaterialIcons name={icon} size={22} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1 pr-2">
          <Text className="text-sm font-semibold text-text" numberOfLines={1}>
            {title}
          </Text>
          <Text className="mt-0.5 text-xs text-text-muted" numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </View>
      <View className="shrink-0">{right}</View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          { backgroundColor: pressed ? colors.surface2 : colors.surface },
        ]}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={{ backgroundColor: colors.surface }}>{inner}</View>;
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const user = useAuthStore((s) => s.user);
  const authenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useLogout();
  const [pushEnabled, setPushEnabled] = useState(false);
  const pushSupported = Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

  const horizontalPad = windowWidth >= 420 ? spacing(3) : spacing(2);
  const avatarSize = Math.round(Math.min(108, Math.max(88, windowWidth * 0.24)));
  const avatarRadius = avatarSize / 2;
  const bottomPad = insets.bottom + spacing(10);

  useEffect(() => {
    if (!pushSupported) return;
    void (async () => {
      const Notifications = await import('expo-notifications');
      const { status } = await Notifications.getPermissionsAsync();
      setPushEnabled(status === 'granted');
    })();
  }, [pushSupported]);

  const togglePush = async (v: boolean) => {
    if (!pushSupported) {
      Alert.alert('Notifications', 'Push notifications require a development build, not Expo Go.');
      return;
    }

    const Notifications = await import('expo-notifications');
    if (v) {
      const { status } = await Notifications.requestPermissionsAsync();
      setPushEnabled(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Notifications', 'Permission denied.');
      }
    } else {
      setPushEnabled(false);
      Alert.alert('Notifications', 'Disable from system settings.');
    }
  };

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const onBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const scrollContentStyle = {
    paddingHorizontal: horizontalPad,
    paddingTop: spacing(2),
    paddingBottom: bottomPad,
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center' as const,
    width: '100%' as const,
  };

  const header = (
    <View
      className="flex-row items-center justify-between border-b border-border bg-surface"
      style={{
        minHeight: spacing(8),
        paddingHorizontal: horizontalPad,
        paddingVertical: spacing(1.5),
      }}
    >
      <View className="min-w-0 flex-1 flex-row items-center" style={{ gap: spacing(1.5) }}>
        <Pressable onPress={onBack} hitSlop={12} className="active:opacity-70">
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text
          className="min-w-0 flex-1 text-xl font-bold text-primary"
          numberOfLines={1}
          style={{ letterSpacing: -0.3 }}
        >
          Account Profile
        </Text>
      </View>
      <Pressable hitSlop={12} onPress={() => Alert.alert('Menu', 'More options coming soon.')}>
        <MaterialIcons name="more-vert" size={24} color={colors.primary} />
      </Pressable>
    </View>
  );

  if (!authenticated || !user) {
    return (
      <View className="flex-1 bg-background">
        {header}
        <View className="flex-1" style={{ paddingHorizontal: horizontalPad, paddingTop: spacing(3) }}>
          <Text className="mb-2 text-base text-text-muted">You are browsing as a guest.</Text>
          <Pressable
            onPress={() => router.replace('/(auth)/welcome')}
            className=" flex-row gap-3 items-center justify-center rounded-xl active:opacity-90"
            style={{
              marginTop: spacing(2),
              paddingVertical: spacing(2),
              backgroundColor: colors.accent,
            }}
          ><>
          <MaterialIcons name="person" size={22} color={colors.background} />
            <Text className="text-background font-bold" >
              Sign in
            </Text>
          </>
          </Pressable>
        </View>
      </View>
    );
  }

  const letter = user.name.trim().charAt(0).toUpperCase() || '?';
  const roleLabel = user.roles?.[0] ?? 'b2c-user';
  const twoFaOn = Boolean(user.two_factor_enabled);
  const pinSet = Boolean(user.transaction_pin_set);

  return (
    <View className="flex-1 bg-background">
      {header}

      <ScrollView
        className="flex-1"
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
          style={{
            paddingHorizontal: spacing(3),
            paddingVertical: spacing(4),
            marginBottom: spacing(4),
          }}
        >
          <View
            className="pointer-events-none absolute rounded-full"
            style={{
              width: spacing(16),
              height: spacing(16),
              top: -spacing(8),
              right: -spacing(8),
              backgroundColor: colors.primaryBright,
              opacity: 0.06,
            }}
          />

          <View className="w-full flex-col items-center" style={{ gap: spacing(3) }}>
            <View className="relative" style={{ width: avatarSize, height: avatarSize }}>
              <LinearGradient
                colors={[colors.primary, colors.primaryBright]}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarRadius,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.12,
                  shadowRadius: 10,
                  elevation: 6,
                }}
              >
                <Text
                  className="font-extrabold text-on-primary"
                  style={{ fontSize: Math.round(avatarSize * 0.38) }}
                >
                  {letter}
                </Text>
              </LinearGradient>
              <View
                className="absolute items-center justify-center rounded-full border-4 border-surface"
                style={{
                  top: spacing(0.5),
                  left: spacing(0.5),
                  width: spacing(3),
                  height: spacing(3),
                  backgroundColor: colors.accent,
                }}
              >
                <MaterialIcons name="verified" size={14} color={colors.onPrimary} />
              </View>
            </View>

            <View className="w-full items-center" style={{ gap: spacing(1) }}>
              <Text
                className="text-center text-2xl font-extrabold text-primary"
                style={{ letterSpacing: -0.4 }}
              >
                {user.name}
              </Text>
              <View className="w-full items-center" style={{ gap: spacing(0.5) }}>
                <View className="max-w-full flex-row items-center justify-center" style={{ gap: spacing(1) }}>
                  <MaterialIcons name="mail-outline" size={16} color={colors.textMuted} />
                  <Text className="max-w-[90%] text-sm font-medium text-text-muted" numberOfLines={2}>
                    {user.email}
                  </Text>
                </View>
                {user.mobile ? (
                  <View className="flex-row items-center justify-center" style={{ gap: spacing(1) }}>
                    <MaterialIcons name="call" size={16} color={colors.textMuted} />
                    <Text className="text-sm font-medium text-text-muted">{user.mobile}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Pressable
              hitSlop={8}
              onPress={() => Alert.alert('Edit profile', 'Profile editing is coming soon.')}
              className="items-center justify-center rounded-full active:opacity-90"
              style={{
                width: spacing(6),
                height: spacing(6),
                backgroundColor: colors.primary,
              }}
            >
              <MaterialIcons name="edit" size={20} color={colors.onPrimary} />
            </Pressable>
          </View>
        </View>

        <Text className="mb-3 px-0.5 text-lg font-bold text-primary">Account Security</Text>
        <View
          className="mb-8 overflow-hidden rounded-2xl border border-border bg-surface"
          style={{ marginBottom: spacing(4) }}
        >
          <ProfileRow
            icon="admin-panel-settings"
            title="Roles"
            subtitle="Access level"
            right={
              <View
                className="max-w-[140px] rounded-full px-3 py-1.5"
                style={{ backgroundColor: colors.chipActiveBg }}
              >
                <Text
                  className="text-center text-[10px] font-bold uppercase text-primary"
                  numberOfLines={1}
                  style={{ letterSpacing: 0.8 }}
                >
                  {roleLabel}
                </Text>
              </View>
            }
          />
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <ProfileRow
            icon="phonelink-lock"
            title="2FA"
            subtitle="Two-factor authentication"
            onPress={() => router.push('/(auth)/two-factor')}
            right={
              <View className="flex-row items-center" style={{ gap: spacing(0.5) }}>
                <Text
                  className="text-xs font-semibold"
                  style={{ color: twoFaOn ? colors.primary : colors.danger }}
                >
                  {twoFaOn ? 'On' : 'Off'}
                </Text>
                <MaterialIcons name="chevron-right" size={22} color={colors.textMuted} />
              </View>
            }
          />
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <ProfileRow
            icon="lock"
            title="Transaction PIN"
            subtitle="Payment verification"
            onPress={() =>
              Alert.alert('Transaction PIN', pinSet ? 'PIN is set.' : 'PIN is not set yet.')
            }
            right={
              <View className="flex-row items-center" style={{ gap: spacing(0.5) }}>
                <Text
                  className="text-xs font-semibold"
                  style={{ color: pinSet ? colors.text : colors.textMuted }}
                >
                  {pinSet ? 'Set' : 'Not set'}
                </Text>
                <MaterialIcons name="chevron-right" size={22} color={colors.textMuted} />
              </View>
            }
          />
        </View>

        <Text className="mb-3 px-0.5 text-lg font-bold text-primary">Notifications</Text>
        <View
          className="mb-8 rounded-2xl border border-border bg-surface"
          style={{ padding: spacing(2.5), marginBottom: spacing(4) }}
        >
          <View
            className="flex-row items-center justify-between"
            style={{ marginBottom: pushSupported ? 0 : spacing(2) }}
          >
            <View className="min-w-0 flex-1 flex-row items-center" style={{ gap: spacing(1.5) }}>
              <View
                className="h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: colors.surface2 }}
              >
                <MaterialIcons name="notifications-active" size={22} color={colors.primary} />
              </View>
              <Text className="min-w-0 flex-1 text-sm font-semibold text-text" numberOfLines={2}>
                Push notifications
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={togglePush}
              disabled={!pushSupported}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.surface}
              ios_backgroundColor={colors.border}
            />
          </View>
          {!pushSupported ? (
            <View
              className="flex-row rounded-xl border border-border"
              style={{
                gap: spacing(1.5),
                padding: spacing(2),
                backgroundColor: colors.surface2,
              }}
            >
              <MaterialIcons name="info" size={22} color={colors.accentDark} style={{ marginTop: 2 }} />
              <Text className="flex-1 text-xs leading-5 text-text-muted">
                Push notifications are unavailable in Expo Go. Use a development build to test them.
              </Text>
            </View>
          ) : null}
        </View>

        <View className="flex-col" style={{ gap: spacing(2), marginTop: spacing(1) }}>
          <Pressable
            disabled={logout.isPending}
            onPress={() => logout.mutate()}
            className="flex-row items-center justify-center rounded-xl active:opacity-90"
            style={{
              paddingVertical: spacing(2),
              gap: spacing(1.5),
              backgroundColor: colors.accent,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {logout.isPending ? (
              <ActivityIndicator color={colors.accentDark} />
            ) : (
              <>
                <MaterialIcons name="logout" size={22} color={colors.background} />
                <Text className=" font-bold text-background" >
                  Sign Out
                </Text>
              </>
            )}
          </Pressable>
          <Text
            className="text-center text-[10px] font-semibold uppercase text-text-muted"
            style={{ letterSpacing: 1.5 }}
          >
            {`Amaze Pays v${appVersion} • Secure Banking`}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
