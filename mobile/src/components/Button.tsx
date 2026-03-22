import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { useTheme } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled = false }: ButtonProps) {
  const theme = useTheme();

  const labelColorByVariant: Record<ButtonVariant, string> = {
    primary: theme.colors.textOnAccent,
    secondary: theme.colors.textPrimary,
    destructive: theme.colors.textOnAccent,
  };

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: theme.colors.accentPrimary,
    },
    secondary: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderColor: theme.colors.accentPrimary,
      borderWidth: 1,
    },
    destructive: {
      backgroundColor: theme.colors.danger,
    },
  };

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { borderRadius: theme.radius.md, opacity: pressed || disabled ? 0.7 : 1 },
        variantStyles[variant],
      ]}
    >
      <Text style={[styles.label, { color: labelColorByVariant[variant] }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});