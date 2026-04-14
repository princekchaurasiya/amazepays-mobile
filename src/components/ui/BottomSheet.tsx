import { colors, spacing } from '@/theme';
import { ReactNode } from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export function BottomSheet({ visible, onClose, title, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/50" onPress={onClose} />
        <View
          className="max-h-[75%] rounded-t-[20px] border-t border-border bg-surface px-4 pt-2"
          style={[
            { paddingBottom: Math.max(insets.bottom, spacing(2)) },
          ]}
        >
          <View className="mb-3 h-1 w-10 self-center rounded bg-border" />
          {title ? <Text className="mb-3 text-lg font-bold text-text">{title}</Text> : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}
