import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme';
import { Button } from './Button';

type ConfirmationModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmVariant?: 'primary' | 'secondary' | 'destructive';
};

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
}: ConfirmationModalProps) {
  const theme = useTheme();

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <Pressable
        accessibilityLabel="Close confirmation modal"
        onPress={onCancel}
        style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.55)' }]}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={[
            styles.content,
            {
              backgroundColor: theme.colors.surfaceCard,
              borderColor: theme.colors.backgroundSecondary,
              borderRadius: theme.radius.lg,
              padding: theme.spacing.lg,
            },
          ]}
        >
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.cardTitle, fontWeight: '700' }}>{title}</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>{message}</Text>
          <View style={styles.actionRow}>
            <Button label={cancelLabel} onPress={onCancel} variant="secondary" />
            <Button label={confirmLabel} onPress={onConfirm} variant={confirmVariant} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    borderWidth: 1,
    gap: 12,
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
});