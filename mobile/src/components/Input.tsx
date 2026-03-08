import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { useTheme } from '../theme';

type InputProps = TextInputProps & {
  label?: string;
  errorText?: string;
};

export function Input({ label, errorText, ...props }: InputProps) {
  const theme = useTheme();
  const hasError = Boolean(errorText);

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={theme.colors.textSecondary}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.backgroundSecondary,
            borderColor: hasError ? theme.colors.danger : theme.colors.backgroundSecondary,
            borderRadius: theme.radius.md,
            color: theme.colors.textPrimary,
            fontSize: theme.typography.body,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: 10,
          },
        ]}
        {...props}
      />
      {hasError ? <Text style={[styles.error, { color: theme.colors.danger, fontSize: theme.typography.meta }]}>{errorText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    minHeight: 44,
    width: '100%',
  },
  error: {
    marginTop: 6,
  },
});