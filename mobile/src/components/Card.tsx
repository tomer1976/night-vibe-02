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
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceCard,
          borderRadius: theme.radius.md,
          padding: theme.spacing.lg,
        },
      ]}
    >
      {title ? (
        <Text style={[styles.title, { color: theme.colors.textPrimary, fontSize: theme.typography.cardTitle, marginBottom: theme.spacing.xs }]}>{title}</Text>
      ) : null}
      {subtitle ? (
        <Text
          style={[styles.subtitle, { color: theme.colors.textSecondary, fontSize: theme.typography.body, marginBottom: theme.spacing.md }]}
        >
          {subtitle}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    lineHeight: 22,
  },
});