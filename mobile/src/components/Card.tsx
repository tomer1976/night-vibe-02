import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme';

type CardProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
}>;

export function Card({ children, title, subtitle }: CardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceCard, borderRadius: theme.radius.md }]}> 
      {title ? <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text> : null}
      {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12,
  },
});