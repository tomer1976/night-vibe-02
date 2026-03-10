import { StyleSheet, Text } from 'react-native';

import { useTheme } from '../theme';

type InlineErrorMessageProps = {
  message?: string;
};

export function InlineErrorMessage({ message }: InlineErrorMessageProps) {
  const theme = useTheme();

  if (!message) {
    return null;
  }

  return <Text style={[styles.error, { color: theme.colors.danger, fontSize: theme.typography.meta }]}>{message}</Text>;
}

const styles = StyleSheet.create({
  error: {
    marginTop: 6,
  },
});