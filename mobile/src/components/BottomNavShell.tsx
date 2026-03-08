import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme';

export type BottomNavItem = {
  key: string;
  label: string;
};

type BottomNavShellProps = {
  activeKey?: string;
  items: BottomNavItem[];
  onItemPress?: (item: BottomNavItem) => void;
};

export function BottomNavShell({ activeKey, items, onItemPress }: BottomNavShellProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.sm,
        },
      ]}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;

        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onItemPress?.(item)}
            style={[
              styles.item,
              {
                backgroundColor: isActive ? theme.colors.accentPrimary : 'transparent',
                borderRadius: theme.radius.md,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
              },
            ]}
            testID={`bottom-nav-${item.key}`}
          >
            <Text style={[styles.label, { color: isActive ? theme.colors.textPrimary : theme.colors.textSecondary, fontSize: theme.typography.bodySmall }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontWeight: '600',
  },
});