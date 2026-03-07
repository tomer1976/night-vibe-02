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
    <View style={[styles.container, { backgroundColor: theme.colors.backgroundSecondary, borderRadius: theme.radius.md }]}> 
      {kind === 'loading' ? <ActivityIndicator color={theme.colors.accentPrimary} size="small" /> : null}
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
      {message ? <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text> : null}
      {actionLabel ? <Button label={actionLabel} onPress={onAction} variant={kind === 'error' ? 'destructive' : 'primary'} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 12,
    textAlign: 'center',
  },
});