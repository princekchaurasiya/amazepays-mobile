import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ms } from 'react-native-size-matters';

type TopAppBarProps = {
  title?: string;
  onPressNotifications?: () => void;
};

export function TopAppBar({ title, onPressNotifications }: TopAppBarProps) {
  const appName = Constants.expoConfig?.name ?? 'AmazePays';

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerTopRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoShell}>
            <Image source={require('../../../assets/logo.png')} style={styles.logoImage} contentFit="contain" />
          </View>
          <Text style={styles.appNameText} numberOfLines={1}>
            {appName}
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Notifications"
          hitSlop={ms(12)}
          onPress={onPressNotifications}
          style={({ pressed }) => [styles.notificationsButton, { opacity: pressed ? 0.65 : 1 }]}
        >
          <Ionicons name="notifications-outline" size={ms(24)} color={colors.primary} />
        </Pressable>
      </View>
      {title ? <Text style={styles.screenTitle}>{title}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing(1.5),
  },
  brandRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.25),
  },
  logoShell: {
    width: ms(44),
    height: ms(44),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: ms(999),
  },
  logoImage: { width: ms(30), height: ms(30) },
  appNameText: {
    flex: 1,
    fontSize: ms(18),
    fontWeight: '800',
    letterSpacing: ms(-0.2),
    color: colors.primary,
  },
  notificationsButton: { padding: spacing(0.5) },
  screenTitle: {
    marginTop: spacing(0.5),
    fontSize: ms(30),
    fontWeight: '800',
    letterSpacing: ms(-0.5),
    color: colors.primary,
  },
});
