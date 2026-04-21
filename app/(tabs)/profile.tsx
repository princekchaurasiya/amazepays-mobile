import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { colors, layout } from '@/theme';
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
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ms } from 'react-native-size-matters';

const spacing = (n: number) => ms(n * 8);

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
    <View style={styles.profileRowInner}>
      <View style={styles.profileRowLeft}>
        <View style={styles.profileRowIconWrap}>
          <MaterialIcons name={icon} size={ms(22)} color={colors.primary} />
        </View>
        <View style={styles.profileRowTextWrap}>
          <Text style={styles.profileRowTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.profileRowSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </View>
      <View style={styles.shrink0}>{right}</View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          { backgroundColor: pressed ? colors.surface2 : colors.surface }
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
      style={{
        ...styles.header,
        minHeight: spacing(8),
        paddingHorizontal: horizontalPad,
        paddingVertical: spacing(1.5),
      }}
    >
      <View style={styles.headerLeft}>
        <Pressable onPress={onBack} hitSlop={ms(12)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
          <MaterialIcons name="arrow-back" size={ms(24)} color={colors.primary} />
        </Pressable>
        <Text
          style={styles.headerTitle}
          numberOfLines={1}
        >
          Account Profile
        </Text>
      </View>
      <Pressable hitSlop={ms(12)} onPress={() => Alert.alert('Menu', 'More options coming soon.')}>
        <MaterialIcons name="more-vert" size={ms(24)} color={colors.primary} />
      </Pressable>
    </View>
  );

  if (!authenticated || !user) {
    return (
      <View style={styles.screen}>
        {header}
        <View style={{ ...styles.guestWrap, paddingHorizontal: horizontalPad, paddingTop: spacing(3) }}>
          <Text style={styles.guestText}>You are browsing as a guest.</Text>
          <Pressable
            onPress={() => router.replace('/(auth)/welcome')}
            style={({ pressed }) => [
              styles.guestButton,
              {
                marginTop: spacing(2),
                paddingVertical: spacing(2),
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <MaterialIcons name="person" size={ms(22)} color={colors.background} />
            <Text style={styles.guestButtonText}>
              Sign in
            </Text>
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
    <View style={styles.screen}>
      {header}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            ...styles.profileCard,
            paddingHorizontal: spacing(3),
            paddingVertical: spacing(4),
            marginBottom: spacing(4),
          }}
        >
          <View
            style={{
              ...styles.profileCardBlob,
              width: spacing(16),
              height: spacing(16),
              top: -spacing(8),
              right: -spacing(8),
            }}
          />

          <View style={styles.profileCardBody}>
            <View style={{ ...styles.avatarWrap, width: avatarSize, height: avatarSize }}>
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
                  shadowOffset: { width: 0, height: ms(6) },
                  shadowOpacity: 0.12,
                  shadowRadius: ms(10),
                  elevation: ms(6),
                }}
              >
                <Text
                  style={[styles.avatarLetter, { fontSize: Math.round(avatarSize * 0.38) }]}
                >
                  {letter}
                </Text>
              </LinearGradient>
              <View
                style={{
                  ...styles.verifiedBadge,
                  top: spacing(0.5),
                  left: spacing(0.5),
                  width: spacing(3),
                  height: spacing(3),
                }}
              >
                <MaterialIcons name="verified" size={ms(14)} color={colors.onPrimary} />
              </View>
            </View>

            <View style={styles.userDetailsWrap}>
              <Text
                style={styles.userName}
              >
                {user.name}
              </Text>
              <View style={styles.userSubDetailsWrap}>
                <View style={styles.userContactRow}>
                  <MaterialIcons name="mail-outline" size={ms(16)} color={colors.textMuted} />
                  <Text style={styles.userContactText} numberOfLines={2}>
                    {user.email}
                  </Text>
                </View>
                {user.mobile ? (
                  <View style={styles.userMobileRow}>
                    <MaterialIcons name="call" size={ms(16)} color={colors.textMuted} />
                    <Text style={styles.userContactText}>{user.mobile}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Pressable
              hitSlop={ms(8)}
              onPress={() => Alert.alert('Edit profile', 'Profile editing is coming soon.')}
              style={({ pressed }) => [
                styles.editButton,
                { width: spacing(6), height: spacing(6), opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <MaterialIcons name="edit" size={ms(20)} color={colors.onPrimary} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account Security</Text>
        <View style={[styles.sectionCard, { marginBottom: spacing(4) }]}>
          <ProfileRow
            icon="admin-panel-settings"
            title="Roles"
            subtitle="Access level"
            right={
              <View
                style={styles.roleChip}
              >
                <Text
                  numberOfLines={1}
                  style={styles.roleChipText}
                >
                  {roleLabel}
                </Text>
              </View>
            }
          />
          <View style={styles.divider} />
          <ProfileRow
            icon="phonelink-lock"
            title="2FA"
            subtitle="Two-factor authentication"
            onPress={() => router.push('/(auth)/two-factor')}
            right={
              <View style={styles.rowRight}>
                <Text
                  style={{ ...styles.rowRightText, color: twoFaOn ? colors.primary : colors.danger }}
                >
                  {twoFaOn ? 'On' : 'Off'}
                </Text>
                <MaterialIcons name="chevron-right" size={ms(22)} color={colors.textMuted} />
              </View>
            }
          />
          <View style={styles.divider} />
          <ProfileRow
            icon="lock"
            title="Transaction PIN"
            subtitle="Payment verification"
            onPress={() =>
              Alert.alert('Transaction PIN', pinSet ? 'PIN is set.' : 'PIN is not set yet.')
            }
            right={
              <View style={styles.rowRight}>
                <Text
                  style={{ ...styles.rowRightText, color: pinSet ? colors.text : colors.textMuted }}
                >
                  {pinSet ? 'Set' : 'Not set'}
                </Text>
                <MaterialIcons name="chevron-right" size={ms(22)} color={colors.textMuted} />
              </View>
            }
          />
        </View>

        <Text style={styles.sectionTitle}>Notifications</Text>
        <View
          style={{ ...styles.sectionCard, padding: spacing(2.5), marginBottom: spacing(4) }}
        >
          <View
            style={{ ...styles.notificationsTopRow, marginBottom: pushSupported ? 0 : spacing(2) }}
          >
            <View style={styles.profileRowLeft}>
              <View style={styles.profileRowIconWrap}>
                <MaterialIcons name="notifications-active" size={ms(22)} color={colors.primary} />
              </View>
              <Text style={styles.profileRowTitle} numberOfLines={2}>
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
              style={{
                ...styles.pushInfoBox,
                padding: spacing(2),
              }}
            >
              <MaterialIcons name="info" size={ms(22)} color={colors.accentDark} style={{ marginTop: spacing(0.25) }} />
              <Text style={styles.pushInfoText}>
                Push notifications are unavailable in Expo Go. Use a development build to test them.
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.bottomActionsWrap}>
          <Pressable
            disabled={logout.isPending}
            onPress={() => logout.mutate()}
            style={({ pressed }) => [
              styles.signOutButton,
              {
                paddingVertical: spacing(2),
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            {logout.isPending ? (
              <ActivityIndicator color={colors.accentDark} />
            ) : (
              <View style={styles.signOutInner}>
                <MaterialIcons name="logout" size={ms(22)} color={colors.background} />
                <Text style={styles.signOutText}>Sign Out</Text>
              </View>
            )}
          </Pressable>
          <Text style={styles.versionText}>
            {`Amaze Pays v${appVersion} • Secure Banking`}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: ms(1),
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
  },
  headerTitle: {
    minWidth: 0,
    flex: 1,
    fontSize: ms(20),
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: ms(-0.3),
  },
  guestWrap: { flex: 1 },
  guestText: {
    marginBottom: spacing(1),
    fontSize: ms(16),
    color: colors.textMuted,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(1.5),
    borderRadius: ms(12),
    backgroundColor: colors.accent,
  },
  guestButtonText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: ms(16),
  },
  profileCard: {
    overflow: 'hidden',
    borderRadius: ms(16),
    borderWidth: ms(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  profileCardBlob: {
    position: 'absolute',
    pointerEvents: 'none',
    borderRadius: ms(999),
    backgroundColor: colors.primaryBright,
    opacity: 0.06,
  },
  profileCardBody: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing(3),
  },
  avatarWrap: { position: 'relative' },
  avatarLetter: {
    fontWeight: '700',
    color: colors.onPrimary,
  },
  verifiedBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(999),
    borderWidth: ms(4),
    borderColor: colors.surface,
    backgroundColor: colors.accent,
  },
  userDetailsWrap: {
    width: '100%',
    alignItems: 'center',
    gap: spacing(1),
  },
  userName: {
    textAlign: 'center',
    fontSize: ms(24),
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: ms(-0.4),
  },
  userSubDetailsWrap: {
    width: '100%',
    alignItems: 'center',
    gap: spacing(0.5),
  },
  userContactRow: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(1),
  },
  userMobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(1),
  },
  userContactText: {
    maxWidth: '90%',
    fontSize: ms(14),
    fontWeight: '400',
    color: colors.textMuted,
  },
  editButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(999),
    backgroundColor: colors.primary,
  },
  sectionTitle: {
    marginBottom: spacing(1.5),
    paddingHorizontal: spacing(0.0625),
    fontSize: ms(18),
    fontWeight: '600',
    color: colors.primary,
  },
  sectionCard: {
    overflow: 'hidden',
    borderRadius: ms(16),
    borderWidth: ms(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  profileRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(2.5),
  },
  profileRowLeft: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
  },
  profileRowIconWrap: {
    width: ms(44),
    height: ms(44),
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(8),
    backgroundColor: colors.surface2,
  },
  profileRowTextWrap: {
    minWidth: 0,
    flex: 1,
    paddingRight: spacing(0.25),
  },
  profileRowTitle: {
    fontSize: ms(14),
    fontWeight: '500',
    color: colors.text,
  },
  profileRowSubtitle: {
    marginTop: spacing(0.5),
    fontSize: ms(12),
    color: colors.textMuted,
  },
  shrink0: { flexShrink: 0 },
  roleChip: {
    maxWidth: ms(140),
    borderRadius: ms(999),
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
    backgroundColor: colors.chipActiveBg,
  },
  roleChipText: {
    textAlign: 'center',
    fontSize: ms(10),
    fontWeight: '600',
    textTransform: 'uppercase',
    color: colors.primary,
    letterSpacing: ms(0.8),
  },
  divider: {
    height: ms(1),
    backgroundColor: colors.border,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.5),
  },
  rowRightText: {
    fontSize: ms(12),
    fontWeight: '500',
  },
  notificationsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pushInfoBox: {
    flexDirection: 'row',
    gap: spacing(1.5),
    borderRadius: ms(12),
    borderWidth: ms(1),
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  pushInfoText: {
    flex: 1,
    fontSize: ms(12),
    lineHeight: ms(20),
    color: colors.textMuted,
  },
  bottomActionsWrap: {
    flexDirection: 'column',
    gap: spacing(2),
    marginTop: spacing(1),
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(12),
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: ms(4) },
    shadowOpacity: 0.2,
    shadowRadius: ms(8),
    elevation: ms(5),
  },
  signOutInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(1.5),
  },
  signOutText: {
    fontWeight: '600',
    color: colors.background,
    fontSize: ms(16),
  },
  versionText: {
    textAlign: 'center',
    fontSize: ms(10),
    fontWeight: '500',
    textTransform: 'uppercase',
    color: colors.textMuted,
    letterSpacing: ms(1.5),
  },
});
