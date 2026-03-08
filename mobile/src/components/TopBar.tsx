import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme';

type TopBarProps = {
  title: string;
  subtitle?: string;
  statusTag?: string;
};

export function TopBar({ title, subtitle, statusTag = 'Mock Mode' }: TopBarProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
        },
      ]}
    >
      <View style={styles.row}>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.textPrimary, fontSize: theme.typography.title }]}>{title}</Text>
        <View style={[styles.statusTag, { backgroundColor: theme.colors.surfaceCard, borderRadius: theme.radius.sm, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs }]}>
          <Text style={[styles.statusText, { color: theme.colors.info, fontSize: theme.typography.label }]}>{statusTag}</Text>
        </View>
      </View>
      {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '700',
  },
  statusTag: {},
  statusText: {
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 8,
  },
});