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
import { Alert, Switch, Text, View } from 'react-native';
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
      <View className="flex-1 bg-background px-4" style={{ paddingTop: insets.top + spacing(2) }}>
        <Text className="mb-2 text-2xl font-extrabold text-text">Profile</Text>
        <Text className="text-text-muted">You are browsing as a guest.</Text>
        <Button title="Sign in" fullWidth onPress={() => router.replace('/(auth)/login')} className="mt-4" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background px-4" style={{ paddingTop: insets.top + spacing(2) }}>
      <Text className="mb-2 text-2xl font-extrabold text-text">Profile</Text>
      <Card className="mb-4">
        <View className="flex-row items-center">
          <Avatar name={user.name} />
          <View className="ml-3 flex-1">
            <Text className="text-lg font-bold text-text">{user.name}</Text>
            <Text className="text-text-muted">{user.email}</Text>
            {user.mobile ? <Text className="text-text-muted">{user.mobile}</Text> : null}
          </View>
        </View>
      </Card>

      <Text className="mb-1 mt-2 font-semibold text-text-muted">Account</Text>
      <Card>
        <Text className="mb-1 text-[13px] text-text-muted">Roles</Text>
        <Text className="text-[15px] text-text">{(user.roles ?? []).join(', ') || 'b2c-user'}</Text>
        <Divider />
        <Text className="mb-1 text-[13px] text-text-muted">2FA</Text>
        <Text className="text-[15px] text-text">{user.two_factor_enabled ? 'Enabled' : 'Off'}</Text>
        <Divider />
        <Text className="mb-1 text-[13px] text-text-muted">Transaction PIN</Text>
        <Text className="text-[15px] text-text">{user.transaction_pin_set ? 'Set' : 'Not set'}</Text>
      </Card>

      <Text className="mb-1 mt-2 font-semibold text-text-muted">Notifications</Text>
      <Card>
        <View className="flex-row items-center justify-between">
          <Text className="text-[15px] text-text">Push notifications</Text>
          <Switch value={pushEnabled} onValueChange={togglePush} disabled={!pushSupported} />
        </View>
        {!pushSupported ? (
          <Text className="mt-2 text-text-muted">
            Push notifications are unavailable in Expo Go. Use a development build to test them.
          </Text>
        ) : null}
      </Card>

      <Button
        title="Sign out"
        variant="destructive"
        fullWidth
        className="mt-6"
        loading={logout.isPending}
        onPress={() => logout.mutate()}
      />
    </View>
  );
}
