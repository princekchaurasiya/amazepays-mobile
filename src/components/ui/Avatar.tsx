import { Text, View } from 'react-native';

export function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
      <Text className="text-xl font-bold text-on-primary">{initial}</Text>
    </View>
  );
}
