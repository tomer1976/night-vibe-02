import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme';

type ListItemProps = {
  title: string;
  subtitle?: string;
  trailingText?: string;
  onPress?: () => void;
};

export function ListItem({ title, subtitle, trailingText, onPress }: ListItemProps) {
  const theme = useTheme();
  const accessibilityLabel = subtitle ? `${title}, ${subtitle}` : title;
  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: 10,
        },
      ]}
    >
      <View style={[styles.leftSection, { marginRight: theme.spacing.md }]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary, fontSize: theme.typography.body }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontSize: theme.typography.meta }]}>{subtitle}</Text> : null}
      </View>
      {trailingText ? <Text style={[styles.trailing, { color: theme.colors.textSecondary, fontSize: theme.typography.meta }]}>{trailingText}</Text> : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  leftSection: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 2,
  },
  trailing: {
    fontWeight: '500',
  },
});