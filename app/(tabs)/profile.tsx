import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { useLogout } from '@/hooks/useAuth';
import { colors, spacing } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const authenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useLogout();
  const [pushEnabled, setPushEnabled] = useState(false);
  const pushSupported = Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

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

  if (!authenticated || !user) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing(2), paddingHorizontal: spacing(2) }]}>
        <Text style={styles.h1}>Profile</Text>
        <Text style={styles.muted}>You are browsing as a guest.</Text>
        <Button title="Sign in" fullWidth onPress={() => router.replace('/(auth)/login')} style={{ marginTop: spacing(2) }} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing(2), paddingHorizontal: spacing(2) }]}>
      <Text style={styles.h1}>Profile</Text>
      <Card style={styles.profileCard}>
        <View style={styles.row}>
          <Avatar name={user.name} />
          <View style={styles.userMeta}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.muted}>{user.email}</Text>
            {user.mobile ? <Text style={styles.muted}>{user.mobile}</Text> : null}
          </View>
        </View>
      </Card>

      <Text style={styles.section}>Account</Text>
      <Card>
        <Text style={styles.label}>Roles</Text>
        <Text style={styles.value}>{(user.roles ?? []).join(', ') || 'b2c-user'}</Text>
        <Divider />
        <Text style={styles.label}>2FA</Text>
        <Text style={styles.value}>{user.two_factor_enabled ? 'Enabled' : 'Off'}</Text>
        <Divider />
        <Text style={styles.label}>Transaction PIN</Text>
        <Text style={styles.value}>{user.transaction_pin_set ? 'Set' : 'Not set'}</Text>
      </Card>

      <Text style={styles.section}>Notifications</Text>
      <Card>
        <View style={styles.switchRow}>
          <Text style={styles.value}>Push notifications</Text>
          <Switch value={pushEnabled} onValueChange={togglePush} disabled={!pushSupported} />
        </View>
        {!pushSupported ? (
          <Text style={[styles.muted, styles.helperText]}>
            Push notifications are unavailable in Expo Go. Use a development build to test them.
          </Text>
        ) : null}
      </Card>

      <Button
        title="Sign out"
        variant="destructive"
        fullWidth
        style={{ marginTop: spacing(3) }}
        loading={logout.isPending}
        onPress={() => logout.mutate()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  h1: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: spacing(1) },
  muted: { color: colors.textMuted },
  profileCard: { marginBottom: spacing(2) },
  row: { flexDirection: 'row', alignItems: 'center' },
  userMeta: { marginLeft: spacing(1.5), flex: 1 },
  name: { color: colors.text, fontSize: 18, fontWeight: '700' },
  section: {
    color: colors.textMuted,
    marginBottom: spacing(0.75),
    marginTop: spacing(1),
    fontWeight: '600',
  },
  label: { color: colors.textMuted, fontSize: 13, marginBottom: 4 },
  value: { color: colors.text, fontSize: 15 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helperText: { marginTop: spacing(1) },
});
