import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { useTheme } from '../theme';
import { InlineErrorMessage } from './InlineErrorMessage';

type InputProps = TextInputProps & {
  label?: string;
  errorText?: string;
  helperText?: string;
};

export function Input({ label, errorText, helperText, ...props }: InputProps) {
  const theme = useTheme();
  const hasError = Boolean(errorText);
  const accessibilityLabel = label ?? props.placeholder ?? 'Input field';

  return (
    <View style={[styles.container, { gap: theme.spacing.xs }]}>
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.label,
            },
          ]}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        accessibilityLabel={accessibilityLabel}
        placeholderTextColor={theme.colors.textSecondary}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.backgroundSecondary,
            borderColor: hasError ? theme.colors.danger : theme.colors.backgroundSecondary,
            borderRadius: theme.radius.md,
            color: theme.colors.textPrimary,
            fontSize: theme.typography.body,
            lineHeight: theme.typography.body + 6,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.md,
          },
          props.multiline
            ? {
                minHeight: 108,
                textAlignVertical: 'top',
              }
            : null,
        ]}
        {...props}
      />
      {helperText && !hasError ? (
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>{helperText}</Text>
      ) : null}
      <InlineErrorMessage message={errorText} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {},
  input: {
    borderWidth: 1,
    minHeight: 44,
    width: '100%',
  },
});