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
    <View style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary, padding: theme.spacing.lg }]}> 
      <Card>
        <Text style={[styles.title, { color: theme.colors.textPrimary, fontSize: theme.typography.pageTitle, marginBottom: theme.spacing.sm }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontSize: theme.typography.body, lineHeight: 22 }]}>{subtitle}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {},
});