import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';

import { getSurfaceElevationStyle, useTheme } from '../theme';

type DiscoveryCandidateCardProps = {
  title: string;
  imageSource: ImageSourcePropType;
  actionLabel: string;
  statusLabel?: string;
  statusTone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  onPress: () => void;
};

export function DiscoveryCandidateCard({
  actionLabel,
  imageSource,
  onPress,
  statusLabel,
  statusTone = 'info',
  title,
}: DiscoveryCandidateCardProps) {
  const theme = useTheme();

  const statusColorByTone: Record<NonNullable<DiscoveryCandidateCardProps['statusTone']>, string> = {
    neutral: theme.colors.textSecondary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
    info: theme.colors.info,
  };

  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radius.sm,
          borderColor: theme.colors.backgroundSecondary,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
        },
        getSurfaceElevationStyle('low'),
      ]}
    >
      <Image source={imageSource} style={[styles.avatar, { borderRadius: 18 }]} />

      <View style={styles.content}>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.bodySmall }}>
          {title}
        </Text>
      </View>

      <View style={[styles.affordanceContainer, { gap: theme.spacing.xs }]}>
        {statusLabel ? (
          <Text style={{ color: statusColorByTone[statusTone], fontSize: theme.typography.meta }}>
            {statusLabel}
          </Text>
        ) : null}

        <View
          style={{
            borderRadius: theme.radius.sm,
            borderWidth: 1,
            borderColor: theme.colors.accentPrimary,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: theme.colors.accentPrimary, fontSize: theme.typography.meta }}>
            {actionLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
  },
  avatar: {
    height: 36,
    width: 36,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  affordanceContainer: {
    alignItems: 'flex-end',
  },
});