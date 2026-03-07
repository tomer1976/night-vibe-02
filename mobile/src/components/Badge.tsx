import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const theme = useTheme();

  const backgroundByTone: Record<BadgeTone, string> = {
    neutral: theme.colors.backgroundSecondary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
    info: theme.colors.info,
  };

  return (
    <View style={[styles.container, { backgroundColor: backgroundByTone[tone], borderRadius: theme.radius.sm }]}> 
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});