import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type Props = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export function Header({ title, onBack, right }: Props) {
  return (
    <View className="flex-row items-center border-b border-border bg-background px-2 py-3">
      <View className="w-10 items-start">
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} className="p-1">
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
        ) : (
          <View className="w-7" />
        )}
      </View>
      <Text className="flex-1 text-center text-lg font-bold text-text" numberOfLines={1}>
        {title}
      </Text>
      <View className="w-10 items-end">{right}</View>
    </View>
  );
}
