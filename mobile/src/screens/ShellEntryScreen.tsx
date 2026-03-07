import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../components';
import { useTheme } from '../theme';

type ShellEntryScreenProps = {
  title: string;
  subtitle: string;
};

export function ShellEntryScreen({ title, subtitle }: ShellEntryScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <Card>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
});