import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme';
import { Button } from './Button';

type StateKind = 'empty' | 'loading' | 'error';

type StateViewProps = {
  kind: StateKind;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function StateView({ kind, title, message, actionLabel, onAction }: StateViewProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radius.md,
          padding: theme.spacing.lg,
        },
      ]}
    >
      {kind === 'loading' ? <ActivityIndicator color={theme.colors.accentPrimary} size="small" /> : null}
      <Text style={[styles.title, { color: theme.colors.textPrimary, fontSize: theme.typography.title, marginTop: theme.spacing.xs }]}>{title}</Text>
      {message ? (
        <Text
          style={[
            styles.message,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.bodySmall,
              marginTop: 6,
              marginBottom: theme.spacing.md,
            },
          ]}
        >
          {message}
        </Text>
      ) : null}
      {actionLabel ? <Button label={actionLabel} onPress={onAction} variant={kind === 'error' ? 'destructive' : 'primary'} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    lineHeight: 20,
    textAlign: 'center',
  },
});