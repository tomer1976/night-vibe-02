import { Pressable, Image, StyleSheet, Text, View } from 'react-native';

import { getSurfaceElevationStyle, useTheme } from '../theme';

type TopBarProps = {
  title: string;
  subtitle?: string;
  statusTag?: string;
  variant?: 'default' | 'main-tab';
  onBackPress?: () => void;
};

export function TopBar({ title, subtitle, statusTag = 'Mock Mode', variant = 'default', onBackPress }: TopBarProps) {
  const theme = useTheme();
  const isMainTabVariant = variant === 'main-tab';

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
        getSurfaceElevationStyle('low'),
      ]}
    >
      <View style={styles.row}>
        <View style={styles.brandRow}>
          {!isMainTabVariant ? (
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              onPress={onBackPress}
              style={[styles.backButton, { borderColor: theme.colors.backgroundPrimary, borderRadius: theme.radius.sm }]}
              testID="top-bar-back-button"
            >
              <Text style={[styles.backButtonText, { color: theme.colors.textPrimary, fontSize: theme.typography.body }]}>‹</Text>
            </Pressable>
          ) : null}
          {isMainTabVariant ? (
            <Image
              accessibilityLabel="Night Vibe logo"
              source={require('../../assets/icon.png')}
              style={[styles.logo, { borderRadius: theme.radius.sm }]}
              testID="top-bar-main-tab-logo"
            />
          ) : null}
          <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.textPrimary, fontSize: theme.typography.title }]}>{title}</Text>
        </View>
        {!isMainTabVariant ? (
          <View style={[styles.statusTag, { backgroundColor: theme.colors.surfaceCard, borderRadius: theme.radius.sm, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs }]}>
            <Text style={[styles.statusText, { color: theme.colors.info, fontSize: theme.typography.label }]}>{statusTag}</Text>
          </View>
        ) : null}
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
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  backButton: {
    alignItems: 'center',
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  backButtonText: {
    fontWeight: '700',
    lineHeight: 20,
  },
  title: {
    fontWeight: '700',
  },
  logo: {
    height: 22,
    width: 22,
  },
  statusTag: {},
  statusText: {
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 8,
  },
});