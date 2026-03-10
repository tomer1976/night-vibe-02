import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme';
import { Badge } from './Badge';
import { Card } from './Card';

type AccountStateTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

type AccountStateBannerCardProps = {
  title: string;
  subtitle?: string;
  statusLabel: string;
  tone?: AccountStateTone;
  detail?: string;
  children?: React.ReactNode;
};

export function AccountStateBannerCard({
  title,
  subtitle,
  statusLabel,
  tone = 'neutral',
  detail,
  children,
}: AccountStateBannerCardProps) {
  const theme = useTheme();

  return (
    <Card subtitle={subtitle} title={title}>
      <View style={{ gap: theme.spacing.sm }}>
        <Badge label={statusLabel} tone={tone} />
        {detail ? <Text style={[styles.detail, { color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }]}>{detail}</Text> : null}
        {children}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  detail: {
    lineHeight: 20,
  },
});