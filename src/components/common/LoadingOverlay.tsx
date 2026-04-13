import { colors } from '@/theme';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';

export function LoadingOverlay({ visible }: { visible: boolean }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
