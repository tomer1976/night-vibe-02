import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme';
import { Badge } from './Badge';

type SafetyStatusBannerProps = {
  title: string;
  detail: string;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  statusLabel?: string;
};

export function SafetyStatusBanner({
  title,
  detail,
  tone = 'warning',
  statusLabel,
}: SafetyStatusBannerProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.backgroundSecondary,
          borderColor: theme.colors.surfaceCard,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.body, fontWeight: '700' }}>{title}</Text>
        {statusLabel ? <Badge label={statusLabel} tone={tone} /> : null}
      </View>
      <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    gap: 8,
    width: '100%',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});