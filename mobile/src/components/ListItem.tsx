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
  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      <View style={styles.leftSection}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {trailingText ? <Text style={[styles.trailing, { color: theme.colors.textSecondary }]}>{trailingText}</Text> : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
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
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leftSection: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  trailing: {
    fontSize: 12,
    fontWeight: '500',
  },
});